// External dependencies
const sendgridMail = require('@sendgrid/mail'),
  showdown = require('showdown'),
  fs = require('fs'),
  axios = require('axios');

// E-mail string templates
const SUBJECT_TEMPLATE = "[ANN] $REPO$ $VERSION$ [$NAME$] released!",
  FOOTER_TEMPLATE = "\n\nRegards,\n\nThe $OWNER_NAME$ team.",
  HEADER_TEMPLATE = "[$REPO$]($REPO_URL$)$REPO_DESCRIPTION$ reached it's [$VERSION$]($RELEASEURL$) version.";

let setCredentials = function() {
  sendgridMail.setApiKey(process.env.SENDGRID_API_TOKEN)
};

async function prepareMessage(recipients) {

  let eventPayload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')),
    converter = new showdown.Converter(),
    repoName = eventPayload.repository.name,
    repoURL = eventPayload.repository.html_url,
    repoDescription = eventPayload.repository.description == null ? "" : ", " + eventPayload.repository.description.toLowerCase(),
    releaseVersion = eventPayload.release.tag_name,
    releaseName = eventPayload.release.name,
    releaseURL = eventPayload.release.html_url;
  const ownerResponse = await axios.get(eventPayload.repository.owner.url);
  let ownerName = await ownerResponse.data.name;

  // This is not efficient but I find it quite readable
  let emailSubject = SUBJECT_TEMPLATE
    .replace("$REPO$", repoName)
    .replace("$VERSION$", releaseVersion)
    .replace("$NAME$", releaseName),

    footer = FOOTER_TEMPLATE
    .replace("$OWNER_NAME$", ownerName),

    header = HEADER_TEMPLATE
    .replace("$REPO$", repoName)
    .replace("$VERSION$", releaseVersion)
    .replace("$REPO_URL$", repoURL)
    .replace("$REPO_DESCRIPTION$", repoDescription)
    .replace("$RELEASEURL$", releaseURL),

    releaseBody = converter.makeHtml(header + "\n\n" + eventPayload.release.body + footer);

  let message = {
    to: 'noreply@github.com',
    from: {
      name: ownerName,
      email: 'notifications@github.com'
    },
    bcc: recipients,
    subject: emailSubject,
    html: releaseBody
  };

  return message
}

sendEmails = function(promise) {

  promise.then( (message) => sendgridMail
    .send(message)
    .then(() => {
      console.log("Mail sent!")
    })
    .catch(error => {

      //Log friendly error
      console.error(error.toString())

      //Extract error message
      const {
        message,
        code,
        response
      } = error

      //Extract response message
      const {
        headers,
        body
      } = response
    }))
}

let getRecipients = function(recipients_url, callback) {

  axios.get(recipients_url).then( (response) => {
    callback(response.data.split(/\r\n|\n|\r/))
  } ).catch( (error) => {
    console.error(error)
    process.exit(1);
  } )

}

setCredentials()
getRecipients(process.env.RECIPIENTS, function(recipients) {
  sendEmails(prepareMessage(recipients))
})
