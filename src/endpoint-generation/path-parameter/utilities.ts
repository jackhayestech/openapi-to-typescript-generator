import { generateType, indent, newLine } from '../../common/utilities'
import { ParamDetail } from '../../types/common.types'
import { PathParameter } from '../../types/endpoint.types'

export const generateParamTypescript = ({ name, schema }: PathParameter): string => {
	if ('$ref' in schema) return ''
	if ('type' in schema) return `export ${generateType(name, schema.type)}${newLine}`

	throw new Error('Parameter allof not supported')
}

export const generateParameterType = (type: string, params: ParamDetail[]): string => {
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
