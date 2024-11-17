# Large File Importer Challenge
## Jerome Gill - jerome2.gill@gmail.com

An exercise in building an ingress system for importing a large CSV into a relational database.

### The challenge

- An endpoint that expects a payload containing a URL, which points to a very large CSV file (multiple GBs) hosted somewhere. This endpoint should load the data in that CSV file and save it to a local database.
- An endpoint that shows the status of the file import process (a simple "running"/"finished"/... will do).
- An endpoint that allows cancelling a running import process.

Optional Goals

- Add tests to your code or outline a testing strategy
- Add more complex import status report (like a "percentage completed" estimation, or an ETA, for example).
- How would you deploy this application in a cloud environment?

### Requirements

- Node v20.10.0 (other versions may work but untested)
- Docker
- Docker Compose

### Running the server

To run the server in dev mode use

```
./script/server
```

NOTE! you may need to run this twice the first time. It does not wait for the db to be up to run migrations.
I ran out of time to fix that

The script folder is inspired by (scripts to rule them all)[https://github.com/github/scripts-to-rule-them-all] from github.

### Running the tests

Complete test suite
 - This includes e2e tests of the app itself, requiring redis and db connection

```
./script/test
``` 

You can pass arguments if you like

```
./script/test --detectOpenHandles app
```

If you want to run individual unit tests

```
yarn test submitUrlService
```

### Curl examples of the routes

I was hosting the csv locally for testing. You may want to update these with the URL of a real CSV.
Don't forget to (encode)[https://www.urlencoder.org/] for post and put routes. 

 - Submit Url

`curl -X POST http://localhost:3000/submit-url -H "Content-Type: application/json" -d '{"url": "http://127.0.0.1:5000/download"}'`


- Check the status of a URL
     - note that the url must be (encoded)[https://www.urlencoder.org/]. 
`curl -X GET "http://localhost:3000/submit-url/status/http%3A%2F%2F127.0.0.1%3A5000%2Fdownload"`


- Cancel a Url
`curl -X PUT "http://localhost:3000/submit-url/cancel/http%3A%2F%2F127.0.0.1%3A5000%2Fdownload"`

### The solution

General architecture

- express   api routes
- postgres  track url submission status and store records
- redis     process url submission and save records

 - An endpoint that expects a payload containing a URL, which points to a very large CSV file (multiple GBs) hosted somewhere. This endpoint should load the data in that CSV file and save it to a local database.
    - /submit-url
    - creates a record of the URL and adds a job to a queue to process the url
    - The worker streams the csv through a pipline where it is parsed by csv-parser
    - Each row is converted to a TripRecord and pushed into an array
    - When the array hits a certain size, it is sent to a second worker process to be saved
- An endpoint that shows the status of the file import process (a simple "running"/"finished"/... will do).
    - /submit-url/status/:url
    - returns a UrlSubmisson entity which tracks the status of imports
    - when the status changes somehow the UrlSubmission entity is updated
- An endpoint that allows cancelling a running import process.
    - /submit-url/cancel/:url
    - finds a UrlSubmission, sets the status to cancelled
    - the url is marked as cancelled in redis state
    - jobs check for the cancelled state before running or launching new jobs
    - if they see the status they exit

### Optional goals

- Add tests to your code or outline a testing strategy
    - I included a few, sparse tests
    - testing strategy would be...
        - integration tests for the express server, and each of the two worker tasks
        - unit tests for services that require detail not covered by integration tests
- Add more complex import status report (like a "percentage completed" estimation, or an ETA, for example).
    - csvStream calculates % complete based on the total file size / bytes read
    - processCsvUrl writes this to the redis state as it processes records
    - submit-url route reads from the redis state
- How would you deploy this application in a cloud environment?
    - I included teraform config generated by chatpgpt from the compose file and package.json
    - I did not spend long on this, or test it in a real cloud but it does include most of the services needed I believe



### Directory structure
 - env              (dev and test .env files)
 - script           (app entry point. server and test are the most important)
 - src/config       (environment vars, redis and typeorm datastore configs)
 - src/migrations   (typeorm migrations)
 - src/models       (typeorm entities)
 - src/queues       (Queue and worker definitions)
 - src/queues/tasks (code to run on workers)
 - src/queues/state (manage redis state - used in cancelling)
 - src/queues/utils (csv processing decoupled from the queue somewhat)
 - src/routes       (express route definitions and a quick bootstrap method)
 - src/services     (interact with models and the queue)
 - src/app.ts       (express server)
 - src/consts.ts    (hardcoded app configuration, routes and other values used by workers. Some could be env vars)
 - src/server.ts    (entry point for serving the app)


 ### Notes on tests

I've included some very rushed and basic testing.

Theres an "integration" test found at `src/app.test.ts` please check the notes within that file for how it is and isn't complete.

Processes and services come with some unit tests.

I didn't do anything special with setting up proper mocking. Just whatever each test needed.