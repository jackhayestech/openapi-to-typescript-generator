import { capitalizeFirstLetter, generateType, getComponentNameFromRef, indent, newLine } from '../common'
import { ConvertedParameters, ParamDetail } from '../types/common.types'
import { Parameter } from '../types/component.types'

export const generateParameterInterface = (params: ConvertedParameters): string => {
	let paramString = `interface Parameters {${newLine}`
	for (const key in params) {
		paramString = `${paramString}${generateParameterType(key, params[key])}${newLine}`
	}
	paramString = `${paramString}}${newLine}${newLine}`
	return paramString
}

const generateParameterType = (type: string, params: ParamDetail[]): string => {
	const parameterKeys = generateParameterKeys(params)
	const parameterType = `${indent}${type}: {${newLine}${parameterKeys}${indent}}`

	return parameterType
}

export const generateParameterKeys = (params: ParamDetail[]) => {
	let paramKeys = ''
	params.forEach((param) => {
		const optional = param.required ? '' : '?'
		paramKeys = `${paramKeys}${indent}${indent}${param.name}${optional}: ${param.interface}${newLine}`
	})
	return paramKeys
}

export const generateParameterObject = (params: ConvertedParameters, param: Parameter, localImports: string[]) => {
	if (!params[param.in]) {
		params[param.in] = []
	}

	if ('$ref' in param.schema) {
		const name = getComponentNameFromRef(param.schema.$ref as string)
		if (!localImports.includes(name)) {
			localImports.push(name)
		}
	}

	params[param.in].push({
		required: param.required,
		name: param.name,
		interface: capitalizeFirstLetter(param.name),
	})
}

export const generateParameterObjectFromRef = (
	params: ConvertedParameters,
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

export const generateParamTypescript = ({ name, schema }: Parameter): string => {
	if ('$ref' in schema) return ''
	if ('type' in schema) return `export ${generateType(name, schema.type)}${newLine}`

	throw new Error('Parameter allof not supported')
}
