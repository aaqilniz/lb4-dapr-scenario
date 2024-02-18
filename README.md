# lb4-dapr-scenario

This is a loopback 4 example that show cases the usage of dapr for pub/sub.

This sample app is using RabbitMQ - hence it needs to be installed.

The Server subscribes to dapr to receive data from the Client app. Currently, the client is intercepting every request received with `sequence` and sends data to its subscribed apps (at this point only the client app is subscribed).

1) Navigate to server directory & run `dapr run --app-id server --components-path ../dapr-components/  --app-port 3000 -- npm start` to start the server app.

2) Try sending messages by the following command:
`dapr publish --publish-app-id server --pubsub app-wise-pub-sub --topic app-wise --data '{"message": "this message should be recieved at the server"}`

[Optional] start the client app to try out the daprized server app.
3) aviage to client directory and run `dapr run --app-id client --components-path ../dapr-components/  --app-port 3001 -- npm start` to start the client app.


The stats will show up at RabbitMQ's interface in the browser.