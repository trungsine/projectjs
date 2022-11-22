// 1 định nghia các web API sẽ sử dụng  
var apiGetProduct = "http://study.imic.edu.vn/api/product/";
var apiGetProductsPagination =
  "http://study.imic.edu.vn/api/product/get-pagination";
var apiAddProduct = "http://study.imic.edu.vn/api/product/add";
var apiUpdateProduct = "http://study.imic.edu.vn/api/product/update";
var apiDeleteProduct = "http://study.imic.edu.vn/api/product/delete/";
var apiCountProduct = "http://study.imic.edu.vn/api/product/count-pagination";

// khai báo biến để sử dụng 
var body_json = {PageIndex : 1 , PageSize: 6, KeyWord : ""};

// 2 hiển thị danh sách sản phẩm theo phân trang  

function Get_Products_Pagination (Index) {
  body_json.PageIndex = Index;
  fetch(apiGetProductsPagination, {
    method : 'post',
    headers: {'Content-Type' : 'application/json'},
    body : JSON.stringify(body_json)
  })
  .then(function (response) {
    return response.json();
  })
  .then (function (data) {
    var result = data.map(function (item) {
    return `<div class="col-md-4 product">
    <div class="card">
          <img data-toggle="modal" onclick ="Get_Product_Detail(this.getAttribute('data-id'))" 
         data-id=${item.productId} data-target="#modal-detail" 
               class="card-img-top" src="${item.image}"
                     alt="${item.productName}">
           <div class="card-body">
            <h5 class="card-title">${item.productName}</h5>
            <p class="card-text">Giá: ${item.price}</p>
            <a  data-id=${item.productId} onclick="Load_product_detail(this.getAttribute('data-id'))" 
            data-toggle="modal" data-target="#modal-add" 
                 class="btn btn-success">Sửa</a>
            <a data-id=${item.productId} onclick= "Delete(this.getAttribute('data-id'))" href="#" 
            class="btn btn-danger">Xóa</a>
           </div>
       </div>
   </div> `;
  })
  document.getElementById('content').innerHTML = result.join("");
  })
  .catch(function (error) {
    // làm gì đó khi xảy ra lỗi
  })
}

// gọi thực thi hàm khi web đã nạp JS
Get_Products_Pagination(1);

// 3 định nghĩa hàm hiển thị thông tin sản phẩm khi click vào ảnh
// data-id = ${item.productId} ->gắn mã sp vào thuộc tính id
// onclick = "GetProductDetail(this.getAttribute('data-id'))"

function Get_Product_Detail(productId) {
  fetch(apiGetProduct + productId)
  .then (function (response) {
    return response.json();
  })
  .then (function (data) {
    var result = `<div class="col-md-4">
    <img class="img-fluid" src=${data.image} alt="${data.productName}">
    </div>
    <div class="col-md-8">
    <p class="para-detail">${data.content}</p>
    </div>`
    document.querySelector("#product-detail").innerHTML = result;
  })
  .catch (function (error) {
    // hihi ko có lỗi
  })
}

// 4 hiển thị thông tin chi tiết sp khi bấm vào nút sửa
// định nghĩa thêm trường ẩn để chứa mã sp. Giúp việc cập nhật sẽ hiệu quả
// <p hidden id="productId"></p>

function Load_product_detail(productId) {
  fetch(apiGetProduct + productId)
  .then(function (response) {
    return response.json();
  })
  .then (function (data) {
    document.querySelector('#productId').innerHTML = data.productId;
    document.querySelector('#txt-ProductName').value = data.productName;
    document.querySelector('#txt-Image').value = data.image;
    document.querySelector('#txt-Content').value = data.content;
    document.querySelector('#txt-Price').value = data.price;
  })
  .catch(function (error) {
    // nooooo bug
  })
}

// 5 định nghĩa hàm cập nhật sp
function Save() {
  // khai bao biến và lấy về các thông tin trên modal
  var product = {
    ProductId : document.querySelector('#productId').innerHTML,
    ProductName : document.querySelector('#txt-ProductName').value,
    Image : document.querySelector('#txt-Image').value,
    Content : document.querySelector('#txt-Content').value,
    Price : Number(document.querySelector('#txt-Price').value)
  }

  // kiểm tra xem là hành động thêm hay cập nhật
  // productId === "" là thêm mới vì mã sp ko có
  var API = '';
  var Method = '';
  // 2.1 trường hợp thêm
  if(product.ProductId === '' ) {
    API = apiAddProduct;
    Method = 'post';
  }
  else {
  API = apiUpdateProduct;
  Method = 'put';
  }
  fetch (
    API,
    {
      method : Method,
      headers : {'Content-Type' : 'application/json'},
      body: JSON.stringify(product)
    })
    .then(function (response) {
      return response.json();
    })
    .then (function (data) {
      if(data.statusCode === 200) {
        Get_Products_Pagination(1)
        bootbox.alert('Thực hiện thành công!')
      }
      else {
        bootbox.alert('Thực hiện thất bại @@')
      }
    })
    .catch (function (error) {})
}

// 6 định nghĩa hàm chức năng thêm khi người dùng click
function Add() {
  document.querySelector('#productId').innerHTML = "";
  document.querySelector('#txt-ProductName').value = "";
  document.querySelector('#txt-Image').value = "";
  document.querySelector('#txt-Content').value = "";
  document.querySelector('#txt-Price').value = 0;
}

// 7 thực hiện chức năng tìm kiếm thông tin sp
var searchElement = document.querySelector('#search-product');
searchElement.addEventListener('keypress', function (e) {
  if(e.key == 'Enter') {
    var value = searchElement.value;
    body_json.KeyWord = value;
    Get_Products_Pagination(1)
  }
}) 

// 8 thực hiện tính năng phân trang
function Load_Pagination_Product () {
  var phantrang = {KeyWord : ''};
  fetch (apiCountProduct,
    {
      method:'post',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(phantrang)
    })
    .then (function (response) {
      return response.json()
    })
    .then (function (data) {
      var totalPage = Math.round(data/body_json.PageSize);
      var paging_str = '';
      for(var i  = 1; i <= totalPage; i++) {
        paging_str += `<li class="page-item">
            <a onclick = "Get_Products_Pagination(this.innerHTML)"
              class="page-link"> ${i} </a> </li>`
      }
      document.querySelector('.pagination').innerHTML = paging_str;
    })
    .catch (function (error) {})
}
//thực thi lệnh phân trang
Load_Pagination_Product()
function Delete (productId) {
  bootbox.confirm('Bạn có chắc nhắn muốn xoá sản phẩm này ?',
    function (result) {
      if (result) {
        fetch(apiDeleteProduct + productId,
          {method: 'delete'})
          .then(function (response) {
            return response.json();
          })
          .then(function (data){
            if (data.statusCode === 200) {
              Get_Products_Pagination(1);
              bootbox.alert('Xoá thành công rồi bạn ơi!');
            }
            else {
              bootbox.alert('Đã xảy ra lỗi trong quá trình này !!!');
            }
          })
          .catch(function (error) {})
      }
  })
}
