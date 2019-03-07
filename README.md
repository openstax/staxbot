# staxly

> a GitHub App built with [probot](https://github.com/probot/probot) that runs a bot with plugins used by OpenStax

# Features

These are features coded into the bot:

### Automatically create a Card when a user reacts to a Slack message ([#18](https://github.com/openstax/staxly/pull/18))

When a user reacts to a Slack message with a `:github:` then a new Card is created (which includes a link back to the Slack chat).

The board that the card is added to depends on the Slack channel, and is configured in `/config.json`.

<a href="https://user-images.githubusercontent.com/253202/36339066-3afefb88-138b-11e8-8194-6c74de55872d.gif"><img width="500" alt="autocreate-cards" src="https://user-images.githubusercontent.com/253202/36339066-3afefb88-138b-11e8-8194-6c74de55872d.gif"/></a>

### Add/Move Project Cards when Issues/PullRequests change ([#42](https://github.com/openstax/staxly/pull/42), [#49](https://github.com/openstax/staxly/pull/49))

It is annoying to remember to add new Cards to a board and move the Cards when the Issue/Pull Request changes.
So the card movement is now automated. Create an Issue/PullRequest and it is added to the board. Merge/Close it and it is moved to the Done column.

You can move cards based on many criteria (adding labels, adding reviews, merging, assigning, etc) and it is all configured by creating a card in the Project column like the following:

```markdown
###### Automation Rules

- `new.issue`
- `added_label` wontfix
```


<a href="https://user-images.githubusercontent.com/253202/37872089-ad7d21ea-2fcd-11e8-81ba-7f3977c102cf.gif"><img width="500" alt="project-issues" src="https://user-images.githubusercontent.com/253202/37872089-ad7d21ea-2fcd-11e8-81ba-7f3977c102cf.gif"/></a>

### Move an Issue to another Repository ([#34](https://github.com/openstax/staxly/pull/34))

To move an Issue, create a Comment on an Issue that begins with `move-to {repository_name}` where `{repository_name}` is the name of the destination repository (without the curly braces).

<a href="https://user-images.githubusercontent.com/253202/36949462-aee82baa-1fb6-11e8-9920-24ad629532ec.gif"><img width="500" alt="project-issues" src="https://user-images.githubusercontent.com/253202/36949462-aee82baa-1fb6-11e8-9920-24ad629532ec.gif"/></a>


### Project Events Export ([#51](https://github.com/openstax/staxly/pull/51))

There is a secret URL to get a CSV or a JSON file of the history of Cards being created and moved which is useful for generating reports.

The URL format is `/project-events/{secret}/json` and `/project-events/{secret}/csv`.


### Slack Channel link-back

When someone mentions a channel in a message, that channel gets a link back to the original message.
This is useful for notifying multiple groups, or casually asking for help.

### Other features
- [#8](https://github.com/openstax/staxly/pull/8) Reminder to add a Pull Request Reviewer
  ![image](https://user-images.githubusercontent.com/253202/35791407-c04a6d56-0a15-11e8-8790-c2d0b4a73d0b.png)
- [#16](https://github.com/openstax/staxly/pull/16) React when a user types `staxly ping` (verify the bot is up)

### Plugins

These are [3rd-party plugins](https://probot.github.io/apps/) that are included in this bot ([See more](https://probot.github.io/apps/)):

- [polls](https://github.com/evenchange4/gh-polls-bot): Add quick polls to an Issue of Pull Request by typing `/polls Option1 'Option 2' "Option 3"`. It will edit the comment/body and add a poll
- _based on_ [changelog](https://github.com/mikz/probot-changelog): Automatically ensure that the `CHANGELOG` is updated for every Pull Request (configured in the repos `/.github/config.yml`)
- [settings](https://github.com/probot/settings): Pull Requests for GitHub repository settings
- [autolabeler](https://github.com/probot/autolabeler): Automatically label Issues and Pull Requests based on logic in the `.github/config.yml` file
- [wip-bot](https://github.com/gr2m/wip-bot): Mark a Pull Request as unmergeable when `WIP` is in the PR title
- [probot-app-todos](https://github.com/uber-workflow/probot-app-todos): Help create Issues when code contains a "TO DO" (no spaces)
- [release-notifier](https://github.com/release-notifier/release-notifier): When a tag is created add a comment on the Pull Request denoting which release it was included in
- [request-info](https://github.com/behaviorbot/request-info): Ask for additional information when a Pull Request description is empty
- [first-pr-merge](https://github.com/behaviorbot/first-pr-merge): Welcome new contributors
- [new-issue-welcome](https://github.com/behaviorbot/new-issue-welcome): Welcome new contributors
- [new-pr-welcome](https://github.com/behaviorbot/new-pr-welcome): Welcome new contributors
- [unfurl](https://github.com/probot/unfurl): Unfurl links



# What do you think of this bot?

A bot would... (click one of the bars to vote and check out the [Issues](https://github.com/openstax/staxly/issues) to see proposals)

[![](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/definitely%20help)](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/definitely%20help/vote)
[![](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/maybe%20help%3F)](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/maybe%20help%3F/vote)
[![](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/not%20help%20my%20problems)](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/not%20help%20my%20problems/vote)
[![](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/waste%20developer%20time)](https://api.gh-polls.com/poll/01C5RWFV2ZS0A6XTREM3Y69ETN/waste%20developer%20time/vote)

If it is doing something wrong or you would like it to do something else, check out the [Issues](https://github.com/openstax/staxly/issues).


# Contributing

To make development approachable to many types of contributors, there are several ways to get your awesome code up and running.
The **Beginner** option is a great way to get started with minimal setup. Knowledge of Git is not even needed!

1. **Beginner**: Start a Pull Request ([staxly-dev](https://github.com/apps/staxly-dev) will be auto-deployed for you) and push up changes until it works
  - As soon as you create the Pull Request, a link to the deployed bot will appear
  - As you continue pushing changes, the bot will automatically be re-deployed and your Pull Request will be updated
  - See [#26](https://github.com/openstax/staxly/pull/26) for a [screncap of the whole process](https://github.com/openstax/staxly/pull/26)
1. **Intermediate**: Ask a maintainer for dev keys to [staxly-dev](https://github.com/apps/staxly-dev)
1. **Advanced**: Follow [probot's instructions for creating a new GitHub App](https://github.com/probot/probot/blob/master/docs/development.md#configure-a-github-app)


Additional details can be found in [CONTRIBUTING.md](./CONTRIBUTING.md).
