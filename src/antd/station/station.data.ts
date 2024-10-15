
	import { ColumnType } from "ant-design-vue/es/table"; 

	export const columns: ColumnType[] = [{
			title: '基站IP',
			dataIndex: 'stationIp',
			align: 'center',
			ellipsis: true,
		},{
			title: '基站地址',
			dataIndex: 'stationAddress',
			align: 'center',
			ellipsis: true,
		},{
			title: '基站状态',
			dataIndex: 'status',
			align: 'center',
			ellipsis: true,
		},{title: '操作', key: 'action', align: 'center', width: 200}] 
	