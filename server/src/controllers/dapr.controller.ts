import { inject } from '@loopback/context';
import { get, post, requestBody, Response, RestBindings } from '@loopback/rest';

export class DaprController {
  constructor() { }

  @get('/dapr/subscribe', { responses: { '200': { 'application/*+json': {} } } })
  async subscribe(
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    return [{
      pubsubname: 'app-wise-pub-sub',
      topic: 'app-wise',
      route: 'event-data'
  }];
  }

  /**
   *
   * @param topic
   */
  @post('/event-data', {
    responses: {
      '200': {
        'application/*+json': {},
      },
    },
  })
  eventReceiver(
    @requestBody({ content: { 'application/*+json': {}, }, })
    body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    console.log('-> data received from subscribed', body.data);
    return { message: 'data received successfully.' };
  }
}
