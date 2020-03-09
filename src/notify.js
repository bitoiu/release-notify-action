const fs           = require('fs');
const axios        = require('axios');
const showdown     = require('showdown');
const sendgridMail = require('@sendgrid/mail');

const setCredentials = () => sendgridMail.setApiKey(process.env.SENDGRID_API_TOKEN);

async function prepareMessage(recipients) {
  const { repository, release } = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));

  const converter = new showdown.Converter();
  const repoName = repository.name;
  const repoURL = repository.html_url;
  const repoDescription = repository.description ? `, ${repository.description.toLowerCase()}` : '';
  const releaseVersion = release.tag_name;
  const releaseName = release.name;
  const releaseURL = release.html_url;
  const ownerResponse = await axios.get(repository.owner.url);
  const ownerName = ownerResponse.data.name;

  // Templates
  const subject = `[ANN] ${repoName} ${releaseVersion} [${releaseName}] released!`;
  const footer = `\n\nRegards,\n\nThe ${ownerName} team`;
  const header = `[${repoName}](${repoURL})${repoDescription} reached it's [${releaseVersion}](${releaseURL}) version.`;

  const releaseBody = converter.makeHtml(`${header}\n\n${release.body}${footer}`);

  return {
    to: 'noreply@github.com',
    from: {
      name: ownerName,
      email: 'notifications@github.com',
    },
    bcc: recipients,
    subject,
    html: releaseBody,
  };
}
async function run(recipientsUrl) {
  const { data } = await axios.get(recipientsUrl);
  const recipients = data.split(/\r\n|\n|\r/);
  const message = await prepareMessage(recipients);
  await sendgridMail.send(message);
  console.log('Mail sent!');
}

/**
 * Run
 */
setCredentials();
run(process.env.RECIPIENTS)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
