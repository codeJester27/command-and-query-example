# CQRS Data Pattern Example
This project demonstrates how CQRS can improve the responsiveness of a system by separating potentially expensive write operations (commands) from possibly quicker read operations (queries).

## About the project
This project consists of the following Javascript files:

- **cqs.js** - An ExpressJS application that demonstrates using a `QueryModel` that can only retrieve data, and `CommandModel` that can only change data. In this example, both models are retrieving/changing data in the same data store.
- **cqrs.js** - This example is the same as above, but the models have separate data stores; the `QueryModel` has a "read" data store, and the `CommandModel` has a "write" data store, which synchronizes with the "read" data store when write operations are finished processing. This allows queries to be fulfilled even while a command is still in progress.
- **shared.js** - Contains code for the data store and command and query models that are used by the above files.

## How to install and run
Make sure you have the latest version of Node.js and npm installed on your system.

Install all of the packages required by running this in a terminal that is inside the `command-and-query-example` directory:
```
npm install
```

You can then run `cqs.js` with this command:
```
node cqs.js
```

You can also run `cqrs.js` with this command:
```
node cqrs.js
```
