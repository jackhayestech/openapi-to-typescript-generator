export type Primitive = String | Number

type SchemaString = 'string'

type SchemaNumber = 'number'

type SchemaObject = 'object'

type SchemaArray = 'array'

export interface PrimitiveSchema {
	type: SchemaString | SchemaNumber
	format?: string
}

export interface ObjectSchema {
	type: SchemaObject
	required?: string[]
	properties?: {
		[key: string]: BasicSchema | ArraySchema
	}
	$ref?: {}
	additionalProperties?: boolean
}

export interface ArraySchemaOneType {
	type: SchemaArray
	items: {
		type?: PrimitiveSchema
		$ref?: string
	}
}

export interface ArraySchemaMultipleTypes {
	type: SchemaArray
	items: {
		anyOf: { type: Primitive }[]
	}
}

export type ArraySchema = ArraySchemaMultipleTypes | ArraySchemaOneType

export interface AllOfSchema {
	allOf: Ref[]
}

export interface Ref {
	$ref: string
}

export type BasicSchema = PrimitiveSchema | ObjectSchema | ArraySchema
export type Schema = AllOfSchema | BasicSchema | Ref
export type Schemas = { [key: string]: Schema }

export type TypedRequestKeys = { body: boolean; params: boolean }

export interface ParamDetail {
	required: boolean
	name: string
	interface: string
}

export interface Params {
	[key: string]: ParamDetail[]
}
