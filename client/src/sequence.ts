import { inject } from '@loopback/core';
import axios from 'axios';
import { FindRoute, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceActions, SequenceHandler } from '@loopback/rest';

export class MySequence implements SequenceHandler {
  /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param findRoute - Finds the appropriate controller method,
   *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
   * @param parseParams - The parameter parsing function (injected
   * via SequenceActions.PARSE_PARAMS).
   * @param invoke - Invokes the method specified by the route
   * (injected via SequenceActions.INVOKE_METHOD).
   * @param send - The action to merge the invoke result with the response
   * (injected via SequenceActions.SEND)
   * @param reject - The action to take if the invoke returns a rejected
   * promise result (injected via SequenceActions.REJECT).
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) { }

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Executes middleware for CORS, OpenAPI spec endpoints
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      const { request, response } = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      const excludingRoutes = [
        '/explorer/', '/dapr/subscribe', '/app-wise',
        '/swagger-ui.css', '/explorer/openapi.json',
        '/swagger-ui-standalone-preset.js', '/swagger-ui-bundle.js',
        '/favicon-32x32.png'
      ];
      /* [START] THIS PART OF THE CODE WOULD SEND MESSAGE TO SUBSCRIBERS TO DAPR [START] */
      if (!excludingRoutes.includes(request.url)) {
        const message = `${request.url} has been invoked.`;
        console.log(message);
        const DAPR_HOST = process.env.DAPR_HOST || 'http://localhost';
        const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
        const PUBSUB_NAME = 'app-wise-pub-sub';
        const PUBSUB_TOPIC = 'app-wise';
        try {
          const value = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/publish/${PUBSUB_NAME}/${PUBSUB_TOPIC}`, { message })
          console.log(`published data ${value.config.data}`)
        } catch (error) {
          console.log('error occured while pub/sub');
          console.log(error);
        }
      }
      /* [END] THIS PART OF THE CODE WOULD SEND MESSAGE TO SUBSCRIBERS TO DAPR [END] */

      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }

}