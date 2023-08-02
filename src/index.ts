#!/usr/bin/env node

import fs from 'fs'
import { parse } from 'yaml'

import { TypescriptGenerator } from './TypescriptGenerator'
import { getFlag } from './utilities'

const fileName = getFlag(process.argv, '-i') as string
const output = getFlag(process.argv, '-o') as string

const file = fs.readFileSync(fileName, 'utf8')
const { paths, components } = parse(file)

new TypescriptGenerator(paths, components, output)
