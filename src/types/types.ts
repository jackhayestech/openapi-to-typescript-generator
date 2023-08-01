import { Ref, Schema } from './common.types'
import { RequestBody } from './component.types'

export interface Paths {
	[key: string]: Methods
}

export interface Methods {
	post?: Endpoint
	get?: Endpoint
	put?: Endpoint
	delete?: Endpoint
}

export interface Response {
	$ref?: string
}

export interface Responses {
	[key: string]: Response
}

type ParamType = 'query' | 'path'

export const isPathParameter = (param: PathParameter | unknown): param is PathParameter => {
	return (param as PathParameter).in !== undefined
}

export interface PathParameter {
	in: ParamType
	name: string
	required: boolean
	description?: string
	schema: Schema
}

export type PathParameters = (PathParameter | Ref)[]

export interface Endpoint {
	parameters?: PathParameters
	requestBody?: RequestBody
	responses?: Responses
	operationId?: string
	description?: string
}
