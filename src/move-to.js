// Move an Issue to another repository when a GitHub comment of the form `move-to {REPO_NAME}` is created on an Issue
const REGEXP = /^move[ -]to ([^ ]+)/i
module.exports = (robot) => {
  const logger = robot.log.child({name: 'move-issue'})
  robot.on([
    'issue_comment.created',
    'issue_comment.edited'
  ], moveIssue)

  async function moveIssue (context) {
    const {payload} = context
    const match = REGEXP.exec(payload.comment.body)
    if (match) {
      const destRepoName = match[1]
      const {owner} = context.repo()
      robot.log.debug(`Attempting to move Issue to ${destRepoName}`)

      // Check if the destination repo exists
      try {
        await context.github.repos.get({owner, repo: destRepoName})
      } catch (err) {
        // Repo does not exist. Create a comment letting the user know that we could not move the Issue
        await context.github.issues.createComment(context.issue({body: `I was unable to move this Issue to https://github.com/${owner}/${destRepoName}. It may not exist or I may not have permissions to that repository. Please check and try again or report it to a developer.`}))
        return
      }

      // Create a new Issue and copy over the title, body, labels, assignees
      robot.log.debug(`Creating new Issue at ${destRepoName}`)
      const {data: newIssue} = await context.github.issues.create({
        owner,
        repo: destRepoName,
        title: payload.issue.title,
        body: `(originally created at ${payload.issue.html_url})\n\n${payload.issue.body}`,
        assignees: payload.issue.assignees.map((assignee) => assignee.login),
        labels: payload.issue.labels.map((label) => label.name)
      })

      // Add a comment to the old Issue that points to the new Issue
      await context.github.issues.createComment(context.issue({body: `Moved Issue to ${newIssue.html_url}`}))
      // Close the old Issue
      await context.github.issues.edit(context.issue({state: 'closed'}))
      logger.info(`Moved Issue to ${newIssue.html_url}`)
    }
  }
}
