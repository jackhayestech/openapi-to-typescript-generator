import { ObjectSchema, Schema } from './common.types'
import { PathParameter, RequestBody } from './endpoint.types'

export interface ComponentParameters {
	[key: string]: PathParameter
}

export interface Components {
	requestBodies?: RequestBodies
	parameters?: ComponentParameters
	schemas?: {
		[key: string]: Schema
	}
	responses?: Responses
}

export interface Responses {
	[key: string]: ReqResponse
}

export interface ReqResponse {
	description?: string
	content: {
		'application/json': {
			schema: ObjectSchema
		}
	}
}

export interface RequestBodies {
	[key: string]: RequestBody
}

export interface RequestBodyContent {
	'application/json': { schema: Schema }
}
