import { Schema } from './common.types'

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
}

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
	['$ref']: string
}
