
	import defHttp from "@/api/index";

	export enum Api {
		AddSupplier = "/Supplier/AddSupplier",
		DeleteSupplier = "/Supplier/DeleteSupplier",
		UpdateSupplier = "/Supplier/UpdateSupplier",
		ShowSupplierPage = "/Supplier/ShowSupplierPage"
	}
	export const AddSupplier = (params) => {
			return defHttp.post({ url: Api.AddSupplier, params });
		};

	export const DeleteSupplier = (params) => {
			return defHttp.post({ url: Api.DeleteSupplier, params });
		};

	export const UpdateSupplier = (params) => {
			return defHttp.post({ url: Api.UpdateSupplier, params });
		};

	export const ShowSupplierPage = (params) => {
			return defHttp.post({ url: Api.ShowSupplierPage, params });
		};
	