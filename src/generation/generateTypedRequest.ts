import { indent, newLine } from '../common'
import { TypedRequestKeys } from '../types/common.types'
import { ImportCollection } from './importCollection'

export const generateExpressJsTypedRequest = (
	typedRequestKeys: TypedRequestKeys,
	typedRequestImports: ImportCollection,
): string => {
	if (!typedRequestKeys.body && !typedRequestKeys.params) return ''

	let comma = false
	let typedRequest = `interface TypedRequest <`
	let typedRequestBody = ''
	let request = `export type Request = TypedRequest<`

	if (typedRequestKeys.params) {
		typedRequestImports.add('Query')
		typedRequest += `T extends Query`
		typedRequestBody += `${indent}query: T${newLine}`
		request += `Parameters['query']`
		comma = true
	}

	if (typedRequestKeys.body) {
		typedRequestBody += `${indent}body: U${newLine}`
		if (comma) {
			request += ','
			typedRequest += ','
		}
		typedRequest += `U`
		request += 'RequestBody'
		comma = true
	}

	typedRequest += `> extends Express.Request{${newLine}${typedRequestBody}}${newLine}${newLine}`
	request += '>'

	return `${typedRequest}${request}`
}
