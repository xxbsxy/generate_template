
	import defHttp from "@/api/index";

	export enum Api {
		AddSupplier1 = "/Supplier/AddSupplier1",
		DeleteSupplier2 = "/Supplier/DeleteSupplier2",
		UpdateSupplier2 = "/Supplier/UpdateSupplier2",
		ShowSupplierPage2 = "/Supplier/ShowSupplierPage2"
	}
	export const AddSupplier1 = (params) => {
			return defHttp.post({ url: Api.AddSupplier1, params });
		};

	export const DeleteSupplier2 = (params) => {
			return defHttp.post({ url: Api.DeleteSupplier2, params });
		};

	export const UpdateSupplier2 = (params) => {
			return defHttp.post({ url: Api.UpdateSupplier2, params });
		};

	export const ShowSupplierPage2 = (params) => {
			return defHttp.post({ url: Api.ShowSupplierPage2, params });
		};
	