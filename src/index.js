module.exports = (robot) => {
  robot.events.setMaxListeners(100) // Since we use multiple plugins

  // Plugins that we use
  require('./slack-stuff')(robot)
  require('./move-to')(robot)
  require('project-bot')(robot)
  require('probot-settings')(robot)
  // require('probot-changelog')(robot)
  require('./changelog')(robot)
  require('autolabeler')(robot)
  require('first-pr-merge')(robot)
  require('new-issue-welcome')(robot)
  require('new-pr-welcome')(robot)
  require('request-info')(robot)
  require('unfurl')(robot)
  // require('probot-app-todos')(robot)
  require('release-notifier')(robot)
  require('wip-bot')(robot)
  require('./project-events')(robot)
  require('gh-polls-bot/src')(robot)

  console.log('Yay, the app was loaded!')

  // Add a ping route
  const app = robot.route('/staxly')
  app.get('/_ping', (req, res) => {
    res.end('Pong')
  })

  // // If someone submits a Pull Request check if it has a reviewer
  // function getSlackUserByGithubIdOrNull (githubId) {
  //   return robot.slackAdapter.getBrain().users.filter(user => {
  //     const {fields} = user.profile
  //     if (fields) { // Not all users have fields
  //       const gitHubField = fields['Xf0MQDURNX']
  //       if (gitHubField) {
  //         return githubId === gitHubField.value
  //       } else {
  //         return false
  //       }
  //     }
  //   })[0]
  // }
  // async function notifySlackUserWhenPullRequestOpened ({payload, github}) {
  //   const {number, html_url: htmlUrl} = payload.pull_request
  //   const {name, owner: {login}} = payload.repository
  //   const senderLogin = payload.sender.login
  //   const {data: {users: reviewRequests}} = await github.pullRequests.getReviewRequests({
  //     owner: login,
  //     repo: name,
  //     number: number
  //   })
  //
  //   const slackUser = getSlackUserByGithubIdOrNull(senderLogin)
  //   if (reviewRequests.length === 0) {
  //     if (slackUser) {
  //       robot.log(`Notifying ${senderLogin} that they opened a Pull Request with no reviewers`)
  //       await robot.slackAdapter.sendDM(slackUser.id, `I noticed you submitted a Pull Request at ${htmlUrl} but did not include any reviewers. *Consider adding a reviewer*.\n\n You can edit my code at https://github.com/openstax/staxly or create an Issue for discussion.`)
  //     } else {
  //       robot.log(`Could not find slack user with GitHub id ${senderLogin}. Ask them to update their profile`)
  //     }
  //   }
  // }
  // robot.on('pull_request.opened', notifySlackUserWhenPullRequestOpened)
  // robot.on('pull_request.reopened', notifySlackUserWhenPullRequestOpened)

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
