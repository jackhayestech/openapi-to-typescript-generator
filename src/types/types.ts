import { Parameters, RequestBody } from './component.types'

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

export interface Endpoint {
	parameters?: Parameters
	requestBody?: RequestBody
	responses?: Responses
	operationId?: string
	description?: string
}
