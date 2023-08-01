import { ObjectSchema, Schema } from './common.types'
import { PathParameter } from './types'

export interface Components {
	requestBodies?: {
		[key: string]: RequestBody
	}
	parameters?: {
		[key: string]: PathParameter
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
	description?: string
	content: {
		'application/json': {
			schema: ObjectSchema
		}
	}
}

export type RequestBody = {
	description?: string
	content?: RequestBodyContent
	$ref?: string
}

export interface RequestBodies {
	[key: string]: RequestBody
}

export interface RequestBodyContent {
	'application/json': { schema: Schema }
}

//TODO delete
type ParamType = 'query' | 'path'

export interface Parameter {
	in: ParamType
	name: string
	required: boolean
	description?: string
	schema: Schema
	$ref?: string
}
