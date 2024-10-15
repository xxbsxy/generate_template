
	import { ColumnType } from "ant-design-vue/es/table"; 

	export const columns: ColumnType[] = [{
			title: '标签地址',
			dataIndex: 'labelAddress',
			align: 'center',
			ellipsis: true,
		},{
			title: '信号强度',
			dataIndex: 'signalIntensity',
			align: 'center',
			ellipsis: true,
		},{
			title: '电池电量',
			dataIndex: 'power',
			align: 'center',
			ellipsis: true,
		},{
			title: '使用状态',
			dataIndex: 'status',
			align: 'center',
			ellipsis: true,
		},{
			title: '基站地址',
			dataIndex: 'stationAddress',
			align: 'center',
			ellipsis: true,
		},{title: '操作', key: 'action', align: 'center', width: 200}] 
	