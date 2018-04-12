const {json2csv} = require('json-2-csv')

// Output the 1000 most-recent events related to Projects and Cards

const MAX_LENGTH = 1000
const MOST_RECENT = []

const COLUMN_CACHE = {}
const PROJECT_CACHE = {}

module.exports = async (robot) => {
  const app = robot.route(`/project-events/${process.env['SECRET_PROJECT_EVENTS_PATH']}`)
  app.get('/json', (req, res) => {
    res.json(MOST_RECENT)
  })
  app.get('/csv', (req, res) => {
    json2csv(MOST_RECENT, (err, csv) => {
      if (err) {
        robot.log.error(err.message)
        res.status(500).send('CSV Parsing Error')
      } else {
        console.log(csv)
        res.send(csv)
      }
    }, {
      prependHeader: true,
      delimiter: {
        field: ',',
        array: ';',
        wrap: '"',
        eol: '\n'
      }
    })
  })

  robot.on('project_card', async (context) => {
    const data = context.payload.project_card
    const column = COLUMN_CACHE[data.column_url] || (await context.github.request({method: 'GET', url: data.column_url, headers: {'accept': 'application/vnd.github.inertia-preview+json'}})).data
    const project = PROJECT_CACHE[column.project_url] || (await context.github.request({method: 'GET', url: column.project_url, headers: {'accept': 'application/vnd.github.inertia-preview+json'}})).data

    // Update the cache
    COLUMN_CACHE[data.column_url] = column
    PROJECT_CACHE[column.project_url] = project

    const entry = {
      eventName: 'project_card',
      action: context.payload.action,
      sender: context.payload.sender.login,
      columnId: column.id,
      columnName: column.name,
      projectId: project.id,
      projectName: project.name,
      id: data.id,
      note: data.note,
      contentUrl: data.content_url,
      creator: data.creator.login,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
    if (context.payload.repository) {
      entry.repositoryId = context.payload.repository.id
      entry.repositoryName = context.payload.repository.full_name
    }
    if (context.payload.organization) {
      entry.organization = context.payload.organization.login
    }
    MOST_RECENT.push(entry)
    if (MOST_RECENT.length > MAX_LENGTH) {
      MOST_RECENT.shift(1)
    }
  })
}
