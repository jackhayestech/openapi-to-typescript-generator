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
	parameters?: any
	requestBody?: any
	responses?: any
}

export interface Parameter {
	in: ParamType
	name: string
	required: boolean
	description: string
	schema: Schema
}

interface Schema {
	type: Primitive
}

type ParamType = 'query' | 'path'

export type Primitive = PrimitiveString | PrimitiveNumber

type PrimitiveString = 'string'

type PrimitiveNumber = 'number'
