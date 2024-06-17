# AI-Assistant

### Description

I have developed AI Assistant which will schedule events, show tasks and utilise NLP to understand user commands. To achieve this, we utilise Azure AD portal for authentication. We then used Dialogflow console ( service provided by Google). Dialogflow console will take user commands as input, identify intent, extract entities and give to MS Graph API for scheduling event in MS Outlook. It will use MS Graph API to fetch events from outlook to show it to user on user's command.

### Tech Stack used:

React, Node.js, Express, AzureAD, Microsoft Graph API, Dialogflow (service by Google).

### Environment Setup

1. Clone this repository and run these commands: <br>
   cd Calendar-Assistant <br>
   npm i<br>
   cd backend<br>
   npm i<br>

2. Since Dialogflow console accepts only https request. Thus, I have created self-signed certificate. You need to upload root.crt to your Microsoft management console in your PC. If the certificates in repository wont work, then do follow these steps to generate your own: <br>
   2.1 Create a root certificate by this command <br>

   openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout rootCA.key -out rootCA.crt -subj "/C=IN/ST=YourState/L=YourCity/O=YourOrganization/CN=RootCA"

   2.2 Create a Certificate Signing Request (CSR) for the Server: Name file as server.csr.cnf <br>

   [req]
   default_bits = 2048
   prompt = no
   default_md = sha256
   req_extensions = req_ext
   distinguished_name = dn

   [dn]
   C = IN
   ST = YourState
   L = YourCity
   O = YourOrganization
   CN = localhost

   [req_ext]
   subjectAltName = @alt_names

   [alt_names]
   DNS.1 = localhost
   IP.1 = 127.0.0.1

   Then generate the CSR:

   openssl req -new -nodes -newkey rsa:2048 -keyout server.key -out server.csr -config server.csr.cnf

2.3 Create a Configuration File for Signing the Certificate: server.ext with the following content: <br>

authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

    [alt_names]
    DNS.1 = localhost
    IP.1 = 127.0.0.1

2.4 Sign the Server Certificate with the Root Certificate: <br>

openssl x509 -req -in server.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile server.ext

2.5 Configure the Node.js Server using the newly created server.crt and server.key.

3. We have used dialogflow-credentials.json in server.js to connect to dialogflow console. It's not allowed to upload here. So please mail me at pragyaastro007@gmail.com

### Use cases:

1. #### Scheduling events:

   On command of user in the format " Schedule a meet with <Person> at <date-time>", event will be scheduled in user's outlook calendar.

2. #### Show Events:

   If user give prompts like this: " Show my events for today", Assistant will show all the events scheduled for that date-time.

3. #### Notifications and Reminders:

   Assitant haven't explicitly implemented this feature but we will utilise outlook notification and reminder facility implicitly. This has advantage because despite the user is inactive on assistant, he/she will get notifications/reminders.

4. #### Resolving conflicts:
   Assistant will show calendar. User can check his/her availabilty and can give commands to assistant for scheduling new events.

### Next Steps

Implementing voice features and giving commands to delete certain events. At present it will be managed manually.
