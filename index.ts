#!/usr/bin/env node

import fs from 'fs'
import { parse } from 'yaml'

import { generateTypescript } from './generation/generateTypescript'
import { getFlag } from './utilities'

const fileName = getFlag(process.argv, '-i') as string

const file = fs.readFileSync(fileName, 'utf8')
const { paths, components } = parse(file)

generateTypescript(paths, components)
