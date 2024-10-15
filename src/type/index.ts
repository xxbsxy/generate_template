import axios from "axios";
import fs from "fs";
import openapiTS from "openapi-typescript";
import generateApi from 'openapi-typescript';
const reset1 = async () => {
	const res = await axios.get("http://192.168.3.130:10052/v3/api-docs/etag", {
		auth: {
			username: "ning",
			password: "ning",
		},
	}) as any;

	openapiTS('http://192.168.3.130:10052/v3/api-docs/etag', {
		auth: 'Basic bmluZzpuaW5n'
	})

	const ast = await openapiTS('http://192.168.3.130:10052/v3/api-docs/etag', {
		auth: 'Basic bmluZzpuaW5n'
	})

	const obj = Object.keys(res.data.components.schemas)

	const arr = [] as string[]

	for (const key of obj) {
		arr.push(`export type ${key} = components['schemas']['${key}']`)
	}


	await fs.writeFileSync('C:\\Users\\cgd\\Desktop\\kf-vue3\\src\\api\\type.ts', ast)


	await fs.appendFileSync('C:\\Users\\cgd\\Desktop\\kf-vue3\\src\\api\\type.ts', arr.join('\n'))

};

reset1()

