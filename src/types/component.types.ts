import { ObjectSchema, Schema } from './common.types'

type ParamType = 'query' | 'path'

export interface Components {
	requestBodies?: {
		[key: string]: RequestBody
	}
	parameters?: {
		[key: string]: Parameter
	}
	schemas?: {
		[key: string]: Schema
	}
	responses?: Responses
}

export interface Responses {
	[key: string]: ReqResponse
}

export interface ReqResponse {
	content: {
		'application/json': {
			schema: ObjectSchema
		}
	}
}

export interface ReqResponseBodyContent {}

export interface RequestBody {
	$ref?: string
}

export interface RequestBodies {
	[key: string]: RequestBody
}

export interface RequestBody {
	description?: string
	content: RequestBodyContent
}

export interface RequestBodyContent {
	'application/json': Parameter
}

export interface Parameter {
	in: ParamType
	name: string
	required: boolean
	description: string
	schema: Schema
	$ref?: string
}
