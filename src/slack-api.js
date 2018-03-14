//
// This adds a `robot.slackAdapter.on('message', ({payload, slack, slackWeb}) => )` function
// The event name is one of https://api.slack.com/rtm#events .
//
// If an event may have a subtype (ie 'message' has 'message_changed' and 'deleted')
// then you can listen also listen to the following events:
//
// - 'message::deleted' : only listen to deleted events
// - 'message::message_changed' : only listen to edited events
// - 'message' : only listen to new messages (no subtype)
//
// Modified from https://github.com/grrowl/probot-slack/blob/master/index.js
// since probot no longer supports robot.on('slack.message')
// because probot events assume a payload which contains the GitHub installation id

const {RTMClient, WebClient} = require('@slack/client')

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_GITHUB_INSTALL_ID = process.env.SLACK_GITHUB_INSTALL_ID

module.exports = (robot) => {
  if (!SLACK_BOT_TOKEN) {
    robot.log.error('SLACK_BOT_TOKEN missing, skipping Slack integration')
  }
  if (!SLACK_GITHUB_INSTALL_ID) {
    robot.log.error('SLACK_GITHUB_INSTALL_ID missing. This is needed to know which authentication to use when creating GitHub Issues/Cards. It can be found in the probot trace output for /installations when LOG_LEVEL=trace')
  }

  let authenticatedGitHubClient

  let rtmBrain

  robot.slackAdapter = new class SlackAdapter {
    on (name, callback) {
      rtmClient.on(name, async (payload) => {
        if (!authenticatedGitHubClient && SLACK_GITHUB_INSTALL_ID) {
          authenticatedGitHubClient = await robot.auth(SLACK_GITHUB_INSTALL_ID)
        }
        const value = {
          payload,
          github: authenticatedGitHubClient || null,
          slack: rtmClient,
          slackWeb: webClient
        }
        robot.log.trace(`slack_event ${name}`, name === 'authenticated' ? '(too_long_to_show_in_logs)' : payload)
        callback(value)
      })
    }
    getBrain () {
      return rtmBrain
    }
    isMe (userId) {
      return rtmBrain.self.id === userId
    }
    myName () {
      return rtmBrain.self.name
    }
    async isMemberOfChannel (channelId) {
      return (await this.getChannelById(channelId)).is_member
    }
    async getChannelById (channelId) {
      return webClient.conversations.info({channel: channelId})
    }
    async getUserById (userId) {
      return webClient.users.info({user: userId})
    }
    async getGithubUserBySlackUserIdOrNull (slackUserId) {
      const slackUser = await this.getUserById(slackUserId)
      const {fields} = slackUser.profile
      if (fields) { // Not all users have fields
        const githubField = fields['Xf0MQDURNX']
        if (githubField) {
          return githubField.value
        }
      }
    }

    getMessageTimestamp (message) {
      switch (message.subtype) {
        case 'message_changed':
          return message.message.ts
        case undefined:
          return message.ts
        case 'message_deleted':
        case 'deleted':
        default:
          throw new Error(`BUG: Cannot get timestamp for a deleted message. Well, I can but you should not be doing things based on deleted messages`)
      }
    }
    getMessagePermalink (channelId, messageTs) {
      return `https://${this.getBrain().team.domain}.slack.com/archives/${channelId}/p${messageTs.replace('.', '')}`
    }
    async convertTextToGitHub (text) {
      const USER_REGEXP = /<@([^>]*)/
      let match
      while ((match = USER_REGEXP.exec(text)) != null) {
        const slackUserId = match[1]
        const githubUserId = await this.getGithubUserBySlackUserIdOrNull(slackUserId)
        if (githubUserId) {
          text = text.replace(`<@${slackUserId}>`, `@${githubUserId}`)
        } else {
          text = text.replace(`<@${slackUserId}>`, `${this.getUserById(slackUserId).name}`)
        }
      }
      return text
    }
    async addReaction (reactionEmoji, message) {
      const ts = this.getMessageTimestamp(message)
      try {
        return await webClient.reactions.add({name: reactionEmoji, channel: message.channel, timestamp: ts})
      } catch (err) {
        // already reacted
        robot.log.trace(`Slack already reacted to the message`)
        robot.log.trace(err)
      }
    }
    async removeReaction (reactionEmoji, message) {
      const ts = this.getMessageTimestamp(message)
      return webClient.reactions.remove({name: reactionEmoji, channel: message.channel, timestamp: ts})
    }
    async sendDM (userId, message) {
      const {channel: {id: dmChannelId}} = await webClient.im.open(userId)
      await rtmClient.sendMessage(message, dmChannelId)
    }
  }()

  if (!SLACK_BOT_TOKEN) {
    robot.log('Skipping Slack connection because SLACK_BOT_TOKEN env var is not set')
    return
  }

  robot.log.trace('Slack connecting...')

  // game start!
  const rtmClient = new RTMClient(SLACK_BOT_TOKEN)
  const webClient = new WebClient(SLACK_BOT_TOKEN)

  // The client will emit an 'authenticated' event on successful connection, with the `rtm.start` payload
  rtmClient.on('authenticated', (rtmStartData) => {
    robot.log.info('Slack successfully authenticated')
    robot.log.info(rtmStartData)
  })

  // you need to wait for the client to fully connect before you can send messages
  rtmClient.on('connected', () => {
    robot.log.info('Slack connected')
  })

  rtmClient.on('error', (payload) => {
    robot.log('slack error', payload)
  })

  // now connect
  rtmClient.start()
}
