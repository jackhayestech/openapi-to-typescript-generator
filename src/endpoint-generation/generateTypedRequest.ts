import { ImportCollection } from '../common/ImportCollection'
import { indent, newLine } from '../common/utilities'

export const generateExpressJsTypedRequest = (
	hasParameters: boolean,
	hasBody: boolean,
	typedRequestImports: ImportCollection,
): string => {
	if (!hasBody && !hasParameters) return ''

	let comma = false
	let typedRequest = `interface TypedRequest <`
	let typedRequestBody = ''
	let request = `export type Request = TypedRequest<`

	if (hasParameters) {
		typedRequestImports.add('Query')
		typedRequest += `T extends Query`
		typedRequestBody += `${indent}query: T${newLine}`
		request += `Parameters['query']`
		comma = true
	}

	if (hasBody) {
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
