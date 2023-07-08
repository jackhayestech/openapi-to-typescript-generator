export const getFlag = (args: string[], flag: string) => {
	const customIndex = process.argv.indexOf(flag)
	let customValue

	if (customIndex > -1) {
		// Retrieve the value after --custom
		customValue = args[customIndex + 1]
	}

	return customValue
}
