import { capitalizeFirstLetter, generateType } from './common'
import { Parameter } from './types'

interface ParamDetail {
	required: boolean
	name: string
	interface: string
}

interface Params {
	[key: string]: ParamDetail[]
}

export const generateParameters = (fileString: string, parameters: Parameter[]) => {
	const params: Params = {}

	parameters.forEach((param) => {
		fileString = generateParamTypescript(fileString, param)
		generateParameterObject(params, param)
	})

	fileString = generateParameterInterface(fileString, params)

	return fileString
}

const generateParameterInterface = (fileString: string, params: Params): string => {
	let paramString = 'interface ReqParameters {\n'
	for (const key in params) {
		paramString = `${paramString}${key}: {\n`
		paramString = generateParameterKeys(paramString, params[key])
		paramString = `${paramString}}\n`
	}
	paramString = `${paramString}}\n`
	return `${fileString}${paramString}`
}

const generateParameterKeys = (paramString: string, params: ParamDetail[]) => {
	params.forEach((param) => {
		const optional = param.required ? '' : '?'
		paramString = `${paramString}\t\t${param.name}${optional}: ${param.interface}\n`
	})
	return paramString
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

const generateParamTypescript = (fileString: string, parm: Parameter): string => {
	return `${fileString}${generateType(parm.name, parm.schema.type)}`
}
