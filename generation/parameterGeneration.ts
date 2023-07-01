import { capitalizeFirstLetter, generateType, indent, newLine } from '../common'
import { Parameter } from '../types/component.types'

interface ParamDetail {
	required: boolean
	name: string
	interface: string
}

interface Params {
	[key: string]: ParamDetail[]
}

export const generateParameters = (operationId: string, parameters?: Parameter[], componentParams?: any) => {
	if (!parameters) return ''

	const params: Params = {}
	let paramString = ''

	parameters.forEach((param) => {
		if (param['$ref']) {
			// TODO
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

const generateParameterObject = (params: Params, param: Parameter): Params => {
	if (!params[param.in]) {
		params[param.in] = []
	}
	params[param.in].push({
		required: param.required,
		name: param.name,
		interface: capitalizeFirstLetter(param.name),
	})
	return params
}

const generateParamTypescript = ({ name, schema }: Parameter): string => {
	if ('type' in schema) return `export ${generateType(name, schema.type)}${newLine}`

	throw new Error('Parameter all of not supported')
}
