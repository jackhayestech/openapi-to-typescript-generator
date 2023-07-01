export type Primitive = String | Number

type SchemaString = 'string'

type SchemaNumber = 'number'

type SchemaObject = 'object'

type SchemaArray = 'array'

export interface PrimitiveSchema {
	type: SchemaString | SchemaNumber
}

export interface ObjectSchema {
	type: SchemaObject
	required?: string[]
	properties: {
		[key: string]: BasicSchema | ArraySchema
	}
}

export interface ArraySchemaOneType {
	type: SchemaArray
	items: {
		type: PrimitiveSchema
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
	allOf: { $ref: string }[]
}

export type BasicSchema = PrimitiveSchema | ObjectSchema | ArraySchema
export type Schema = AllOfSchema | BasicSchema
