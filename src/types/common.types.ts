export type Primitive = String | Number

type SchemaString = 'string'

type SchemaNumber = 'number'

type SchemaObject = 'object'

type SchemaArray = 'array'

export interface PrimitiveSchema {
	type: SchemaString | SchemaNumber
	format?: string
	enum?: string[]
}

export interface ObjectSchema {
	type: SchemaObject
	required?: string[]
	properties?: {
		[key: string]: BasicSchema | ArraySchema
	}
	$ref?: string
	additionalProperties?: boolean
}

export interface ArraySchemaOneType {
	type: SchemaArray
	items: {
		type?: PrimitiveSchema
		$ref?: string
	}
}

export type AnyOf =
	| {
			type: Primitive
	  }
	| Ref

export interface ArraySchemaMultipleTypes {
	type: SchemaArray
	items: {
		anyOf: AnyOf[]
	}
}

export type ArraySchema = ArraySchemaMultipleTypes | ArraySchemaOneType

export type AllOfSchema = {
	allOf: (Ref | ObjectSchema)[]
}

export interface Ref {
	$ref: string
}

export type BasicSchema = PrimitiveSchema | ObjectSchema | ArraySchema
export type Schema = AllOfSchema | BasicSchema | Ref
export type Schemas = { [key: string]: Schema }

export interface ParamDetail {
	required: boolean
	name: string
	interface: string
}

export interface ConvertedParameters {
	[key: string]: ParamDetail[]
}
