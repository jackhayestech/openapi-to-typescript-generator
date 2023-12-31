import { Components } from '../types/component.types'
import { Paths } from '../types/endpoint.types'

export const paths: Paths = {
	'/event': {
		post: {
			operationId: 'CreateEvent',
			parameters: [{ $ref: '#/components/parameters/QueryUserUuid' }],
			requestBody: { $ref: '#/components/requestBodies/CreateEvent' },
			responses: {
				'200': { $ref: '#/components/responses/SingleEventResponse' },
				default: { $ref: '#/components/responses/ServerErrorResponse' },
			},
		},
	},
	'/event/{eventUuid}': {
		get: {
			operationId: 'GetEvent',
			parameters: [{ $ref: '#/components/parameters/EventUuid' }],
			description: 'Returns a created event.',
			responses: {
				'200': { $ref: '#/components/responses/SingleEventResponse' },
				default: { $ref: '#/components/responses/ServerErrorResponse' },
			},
		},
	},
	'/user-events/{userUuid}': {
		get: {
			operationId: 'GetUserEvents',
			parameters: [{ $ref: '#/components/parameters/PathUserUuid' }],
			description: 'Returns a list of events the user owns',
			responses: {
				'200': { $ref: '#/components/responses/MultipleEventResponse' },
				default: { $ref: '#/components/responses/ServerErrorResponse' },
			},
		},
	},
}

export const components: Components = {
	parameters: {
		QueryUserUuid: { in: 'query', name: 'userUuid', schema: { $ref: '#/components/schemas/UserUuid' }, required: true },
		PathUserUuid: { in: 'path', name: 'userUuid', schema: { $ref: '#/components/schemas/UserUuid' }, required: true },
		EventUuid: {
			in: 'path',
			name: 'eventUuid',
			schema: { $ref: '#/components/schemas/EventUuid' },
			required: true,
			description: 'The events uuid the request is trying to retrieve',
		},
	},
	requestBodies: {
		CreateEvent: {
			description: 'Creates a new event.',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['data'],
						properties: { data: { type: 'object', $ref: '#/components/schemas/CreateEventData' } },
					},
				},
			},
		},
	},
	responses: {
		ServerErrorResponse: {
			description: 'Internal server error',
			content: {
				'application/json': {
					schema: {
						additionalProperties: false,
						type: 'object',
						properties: { errors: { type: 'array', items: { $ref: '#/components/schemas/ServerError' } } },
					},
				},
			},
		},
		SingleEventResponse: {
			description: 'Returns a single event',
			content: {
				'application/json': {
					schema: { type: 'object', properties: { data: { type: 'object', $ref: '#/components/schemas/Event' } } },
				},
			},
		},
		MultipleEventResponse: {
			description: 'Returns multiple events',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Event' } } },
					},
				},
			},
		},
	},
	schemas: {
		ServerError: {
			additionalProperties: false,
			type: 'object',
			properties: {
				id: { type: 'string' },
				code: { type: 'string' },
				status: { type: 'number' },
				title: { type: 'string' },
				detail: { type: 'string' },
				meta: { type: 'object' },
			},
		},
		CreateEventData: {
			type: 'object',
			additionalProperties: false,
			properties: {
				name: { type: 'string' },
				dateTime: { type: 'string' },
				location: { type: 'string' },
				description: { type: 'string' },
			},
			required: ['name'],
		},
		EventDbData: {
			type: 'object',
			additionalProperties: false,
			properties: {
				uuid: { type: 'string', format: 'uuid' },
				owners: { type: 'array', items: { $ref: '#/components/schemas/UserUuid' } },
			},
			required: ['owners', 'uuid'],
		},
		Event: { allOf: [{ $ref: '#/components/schemas/CreateEventData' }, { $ref: '#/components/schemas/EventDbData' }] },
		UserUuid: { type: 'string', format: 'uuid' },
		EventUuid: { type: 'string', format: 'uuid' },
	},
}
