import { generateType, indent, newLine } from '../../common'
import { ParamDetail } from '../../types/common.types'
import { Parameter } from '../../types/component.types'

export const generateParamTypescript = ({ name, schema }: Parameter): string => {
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
