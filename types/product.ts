export interface IProduct {
_id: string
title: string
sales_price: number 
price: number | null
category: string
description?: string
subcategory: string 
is_deleted: boolean
image_urls?: [string]
image:string
stock: number
}