import { Primitive } from './types'

export const generateType = (key: string, value: Primitive): string => {
	return `type ${capitalizeFirstLetter(key)} = ${value} \n`
}

export const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
