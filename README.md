# Aristi | AI Calendar Assistant

### Overview
Aristi is an intelligent AI calendar assistant designed to schedule events, display tasks, and understand user commands using Natural Language Processing (NLP). Authentication is managed via Azure AD portal, while user commands are processed using Dialogflow (a service by Google). The assistant utilizes Microsoft Graph API to schedule events in MS Outlook and fetch events from Outlook based on user commands. Reminders and notifications will be managed through MS outlook because it will work even when user is inactive on Aristi Platform.

### Tech Stack
<ul>
<li>Frontend: React</li>
<li>Backend: Node.js, Express</li>
<li>Authentication: Azure AD</li>
<li>APIs: Microsoft Graph API, Google cloud Dialogflow API</li>
<li>NLP: Dialogflow console (Google)</li</ul>

### Environment Setup
<ol>
<li>Basic setup
   To set up the environment, clone this repository and run the following commands:</li><br>
   
  ```
 cd Calendar-Assistant
npm i
cd backend
npm i
```


<li> HTTPS Configuration</li> Dialogflow console accepts only HTTPS requests. Thus, a self-signed certificate is required. If the certificates in the repository do not work, follow these steps to generate your own: <br>
   2.1. Create a root certificate <br>
   
```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout rootCA.key -out rootCA.crt -subj "/C=IN/ST=YourState/L=YourCity/O=YourOrganization/CN=root"
```

   2.2 Create a Certificate Signing Request (CSR) for the Server: <br>
      Create a file named server.csr.cnf with the following content<br>

```
      [req]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn```

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
```
   Then Generate the CSR: <br>
```
   openssl req -new -nodes -newkey rsa:2048 -keyout server.key -out server.csr -config server.csr.cnf
```
2.3 Create a Configuration File for Signing the Certificate: server.ext with the following content: <br>
```
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
```

2.4 Sign the Server Certificate with the Root Certificate: <br>
```
openssl x509 -req -in server.csr -CA root.crt -CAkey root.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile server.ext
```
2.5 Configure the Node.js Server using the newly created server.crt and server.key. <br>

<li> Dialogflow Configuration</li>
We use dialogflow-credentials.json in server.js to connect to the Dialogflow console. This file cannot be uploaded here. It's link is in Google form.
</ol>

### Use Cases
#### Scheduling Events
<B> Command Format: </B>"Schedule a meeting with [Person] at [Time]"<br>
<B> Action:</B>  Schedules an event in the user's Outlook calendar.
#### Show Events
<B> Command Examples:</B>  "Show my events for today"<br>
<B> Action: </B> Displays all events scheduled for the specified date-time. 
#### Notifications and Reminders
The assistant leverages Outlook's notification and reminder functionality, ensuring users receive notifications/reminders even when not actively using the assistant.
#### Resolving Conflicts
Users can check their availability and instruct the assistant to schedule new events accordingly.

### Next Steps
Implement voice features. <br>
Add functionality to delete events via commands.
