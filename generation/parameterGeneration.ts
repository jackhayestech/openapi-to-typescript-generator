import { capitalizeFirstLetter, generateType, getComponentNameFromRef, indent, newLine } from '../common'
import { Parameter } from '../types/component.types'

interface ParamDetail {
	required: boolean
	name: string
	interface: string
}

interface Params {
	[key: string]: ParamDetail[]
}

export const generateParameters = (
	operationId: string,
	imports: string[],
	parameters?: Parameter[],
	componentParameters?: {
		[key: string]: Parameter
	},
): string => {
	if (!parameters) return ''

	const params: Params = {}
	let paramString = ''

	parameters.forEach((param) => {
		if (param.$ref) {
			const name = getComponentNameFromRef(param.$ref)
			imports.push(name)
			generateParameterObjectFromRef(params, name, componentParameters)
		} else {
			paramString += generateParamTypescript(param)
			generateParameterObject(params, param)
		}
	})

	paramString += generateParameterInterface(operationId, params)

	return paramString
}

const generateParameterInterface = (operationId: string, params: Params): string => {
	let paramString = `export interface ${operationId}Parameters {${newLine}`
	for (const key in params) {
		paramString = `${paramString}${generateParameterType(key, params[key])}${newLine}`
	}
	paramString = `${paramString}}${newLine}`
	return paramString
}

const generateParameterType = (type: string, params: ParamDetail[]): string => {
	const parameterKeys = generateParameterKeys(params)
	const parameterType = `${indent}${type}: {${newLine}${parameterKeys}${indent}}`

	return parameterType
}

const generateParameterKeys = (params: ParamDetail[]) => {
	let paramKeys = ''
	params.forEach((param) => {
		const optional = param.required ? '' : '?'
		paramKeys = `${paramKeys}${indent}${indent}${param.name}${optional}: ${param.interface}${newLine}`
	})
	return paramKeys
}

const generateParameterObject = (params: Params, param: Parameter) => {
	if (!params[param.in]) {
		params[param.in] = []
	}
	params[param.in].push({
		required: param.required,
		name: param.name,
		interface: capitalizeFirstLetter(param.name),
	})
}

const generateParameterObjectFromRef = (
	params: Params,
	name: string,
	componentParameters?: {
		[key: string]: Parameter
	},
) => {
	if (!componentParameters) {
		throw new Error('Component params expected')
	}

	if (!(name in componentParameters)) {
		throw new Error('Expected param not in component params')
	}

	const param = componentParameters[name]

	if (!params[param.in]) {
		params[param.in] = []
	}

	params[param.in].push({
		required: param.required,
		name: param.name,
		interface: name,
	})
}

const generateParamTypescript = ({ name, schema }: Parameter): string => {
	if ('type' in schema) return `export ${generateType(name, schema.type)}${newLine}`

	throw new Error('Parameter all of not supported')
}
