// Merge base into PR branch whenever updated

const repoConfigs = [
  {
    repo: 'event-capture-api',
    owner: 'openstax',
    match: (pr) => pr.draft !== true
  },
  {
    repo: 'highlights-api',
    owner: 'openstax',
    match: (pr) => pr.draft !== true
  },
  {
    repo: 'open-search',
    owner: 'openstax',
    match: (pr) => pr.draft !== true
  },
  {
    repo: 'unified-deployment',
    owner: 'openstax',
    match: (pr) => pr.draft !== true
  },
  {
    repo: 'rex-web',
    owner: 'openstax',
    match: (pr) => pr.draft !== true &&
      !pr.labels.map(({name}) => name).includes('disable-base-merge') &&
      pr.head.ref.indexOf('update-content-') !== 0
  },
  {
    repo: 'testing-stuff',
    owner: 'tomwoodward',
    match: (pr) => pr.draft !== true
  },
  {
    repo: 'testrepo',
    owner: 'testowner',
    match: (pr) => pr.draft !== true
  }
]

export default (robot) => {
  const logger = robot.log.child({name: 'merge-bases'})
  robot.on([
    'push'
  ], checkForPrs)

  const processPrs = (context, config) => ({data}) => {
    const {owner, repo} = context.repo()

    return Promise.all(data.map(pr => {
      if (!config.match(pr)) {
        logger.info(`skipping base update for ${owner}/${repo}#${pr.number} because it doesn't match criteria`)
        return Promise.resolve()
      }

      logger.info(`updating base for ${owner}/${repo}#${pr.number}`)
      return context.github.pulls.updateBranch({
        owner,
        repo,
        pull_number: pr.number
      })
        .catch(error => {
          if (error.status === 422) {
            // 422 is returned when there is a merge conflict, don't explode on these errors
            logger.info(`github response (422): ${error.message}`)
          } else {
            return Promise.reject(error)
          }
        })
    }))
  }

  function checkForPrs (context) {
    const {payload} = context

    const base = payload.ref.replace(/^refs\/heads\//, '')
    const {owner, repo} = context.repo()

    const config = repoConfigs.find(config => config.repo === repo && config.owner === owner)

    if (!config) {
      return
    }

    logger.info(`received push event for ${base}`)

    return context.github.paginate(
      context.github.pulls.list.endpoint.merge({
        owner,
        repo,
        base,
        state: 'open'
      }),
      processPrs(context, config)
    )
      .then(pagePromises => Promise.all(pagePromises))
  }
}
