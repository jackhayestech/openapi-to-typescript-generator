import { Parameter, RequestBody } from './component.types'

export interface Paths {
	[key: string]: Methods
}

export interface Methods {
	post?: Endpoint
	get?: Endpoint
	put?: Endpoint
	delete?: Endpoint
}

export interface Endpoint {
	parameters?: Parameter[]
	requestBody?: RequestBody
	responses?: any
	operationId?: string
}
