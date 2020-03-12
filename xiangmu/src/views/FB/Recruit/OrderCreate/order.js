/*
新增订单 》订单管理
2018-05-31
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
  Checkbox, message, Table, Select, Radio, Tabs
} from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group
const TabPane = Tabs.TabPane;
import NumericInput from '@/components/NumericInput';
import EditForm from '@/components/EditForm';
import ChooseProduct from './choose_product';
import ChooseDiscount from './choose_discount';
import AreasSelect from '@/components/AreasSelect';

const btnformItemLayout = {
  wrapperCol: { span: 24 },
};

const dateFormat = 'YYYY-MM-DD';
import {
  getViewEditModeTitle, dataBind, timestampToTime,
  getCurrentTimeStamp, getDictionaryTitle, formatMoney, formatMoment
} from '@/utils';
import { loadBizDictionary, searchFormItemLayout24, searchFormItemLayout } from '@/utils/componentExt';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import SelectDiscount from '@/components/BizSelect/SelectDiscount';
import FileDownloader from '@/components/FileDownloader';
import UploadRemarkFile from '@/components/UploadRemarkFile';
import { studentById, getOrderById } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';
import { orgTeachCenterOnByBranchId, getTeachCenterByUserList } from '@/actions/base';
import { queryMaxDiscountQuotaByItems, queryPayeeTypeByBranchId, checkCourseIsStudy, getCourseCategoryPrice } from '@/actions/recruit';

import ProductView from '@/components/ProductDetail/view'

//let STAFF_LIMIT = 200;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class OrderEdit extends React.Component {
  product_index_last: number;
  discount_index_last: number;
  choosed_discount_single: any;
  constructor(props) {
    super(props);
    var _discount = [];
    _discount.push({});
    _discount.push({});
    this.state = { 
      editMode: props.editMode,
      dataModel: props.currentDataModel || {},//数据模型
      bz_teach_center_list: [],
      bz_payee_type_list: [],
      isShowChooseProduct: false,   //是否显示 选择商品列表页
      isShowChooseDiscount: false,   //是否显示 折扣列表页
      isShowProductDetail: false,    //是否显示商品详情框
      productDetail: {},     //商品详情
      product_list: [],   //已选的商品列表
      productIds: [],   //已选商品id
      discountIds: [],   //已选优惠id

      bz_discount_single_list: _discount,    //整单折扣列表
      term_list: [],   //分期列表

      fee_list: [],   //非方向班 的费用列表

      staff_limit: 0,   //员工限额
      first_discount_scale: 100,  //首期付款比例
      stafflDiscountAmount: 0,  //员工特殊优惠
      partnerInfo: null,     //所选大客户的信息
      //payeeType: props.editMode == "OrderPerson" ? 1 : "",      //收费方  个人订单默认 中博教育
      payeeType: '',

      term_num: 1,    //默认一期，即整单
      courseCategoryList: [],

      category_money_list: [],  //暂存 按科目计算的订单应付金额。在分期处根据需要来合并
      isCustomizeInstalment: props.isCustomizeInstalment || '0',   //是否为自定义分期
      discountType: 1,
      fullPriceCondition: null,
    };
    this.product_index_last = 0;
    this.discount_index_last = 0;
    this.choosed_discount_single = null;
    this.isNeedResetTerm = false;
    (this: any).onSubmit = this.onSubmit.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).getStudentById = this.getStudentById.bind(this);
    (this: any).getTeachCenters = this.getTeachCenters.bind(this);
    (this: any).getOrderById = this.getOrderById.bind(this);
    (this: any).getMaxDiscountQuota = this.getMaxDiscountQuota.bind(this);
    (this: any).getPayeeTypeByBranchId = this.getPayeeTypeByBranchId.bind(this);

    (this: any).onChoosedProduct = this.onChoosedProduct.bind(this);  //选商品后回调
    (this: any).onChooseProduct = this.onChooseProduct.bind(this);    //选商品按钮
    (this: any).onChooseDiscount = this.onChooseDiscount.bind(this);
    (this: any).onChoosedDiscount = this.onChoosedDiscount.bind(this);
    (this: any).onHideModal = this.onHideModal.bind(this);
    (this: any).onRemove = this.onRemove.bind(this);
    (this: any).onAddDiscountSingle = this.onAddDiscountSingle.bind(this);
    (this: any).checkAndFillData = this.checkAndFillData.bind(this);
    (this: any).onDiscountNumberChange = this.onDiscountNumberChange.bind(this);
    (this: any).calculateFee = this.calculateFee.bind(this);
    (this: any).onDiscountChange = this.onDiscountChange.bind(this);
    (this: any).onSelectTermChange = this.onSelectTermChange.bind(this);
    (this: any).onButtonChooseTerm = this.onButtonChooseTerm.bind(this);
    (this: any).onMoneyNumberChange = this.onMoneyNumberChange.bind(this);
    (this: any).onDateChange = this.onDateChange.bind(this);
    (this: any).disabledPayableDate = this.disabledPayableDate.bind(this);
    (this: any).setTermMoneyByCategory = this.setTermMoneyByCategory.bind(this);
    (this: any).onCourseCategoryChange = this.onCourseCategoryChange.bind(this);
  }

  componentWillMount() {
    //this.loadBizDictionary(['discount_type', 'partner_class_type']);
    this.loadBizDictionary(['discount_type', 'payee_type']);
    this.getTeachCenters();
    this.getStudentById();
    this.getPayeeTypeByBranchId();
    this.getOrderById();
  }
  getTeachCenters() {
    if (!this.props.branchId) {
      return;
    }
    // this.props.orgTeachCenterOnByBranchId(this.props.branchId).payload.promise.then((response) => {
    //   let data = response.payload.data;
    //   if (data.state === 'success') {
    //     var list = [];
    //     data.data.map(i => {
    //       list.push({
    //         value: i.orgId,
    //         title: i.orgName
    //       })
    //     })
    //     this.setState({
    //       bz_teach_center_list: list
    //     });
    //   }
    //   else {
    //     message.error(data.message);
    //   }
    // })
    
    //获取用户负责下的教学点

    this.props.getTeachCenterByUserList().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = [];
        data.data.map(i => {
          list.push({
            value: i.orgId,
            title: i.orgName,
            state: i.state
          })
        })
        this.setState({
          bz_teach_center_list: list
        });
      }
      else {
        message.error(data.message);
      }
    })
  }
  getPayeeTypeByBranchId() {
    this.props.queryPayeeTypeByBranchId().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = [];
        data.data.map(i => {
          list.push({
            value: i.zbPayeeType,
            title: getDictionaryTitle(this.state.payee_type, i.zbPayeeType)
          })
        })
        this.setState({
          bz_payee_type_list: list
        });
      }
      else {
        message.error(data.message);
      }
    })
  }
  getStudentById() {
    if (this.props.studentId) {
      this.props.studentById(this.props.studentId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          //data.data.startDate = timestampToTime(data.data.startDate);
          //data.data.endDate = timestampToTime(data.data.endDate);
          this.setState({
            dataModel: data.data
          });
        }
        else {
          message.error(data.message);
        }
      })
    }
  }
  getOrderById() {
    if (this.props.orderId) {
      var that = this;
      this.props.getOrderById(this.props.orderId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          var p_list = [];
          var p_id_list = [];
          data.data.orderProductList.map(p => {
            p.partner_class_type = "方向班";
            p.terms = p.term;
            p.orgType = p.priceSource;
            p.productTotalPrice = p.initialPrice,
              p.discount = {
                productDiscountPrice: p.productDiscountPrice,
                productDiscountId: p.productDiscountId
              }
            p.courseCategoryLst = [];
            //添加项目Ids，用于 选择新增商品
            p.itemIds = "";
            if (p.orderCourseProductList && p.orderCourseProductList.length) {
              p.orderCourseProductList.map(cp => {
                p.itemIds += cp.itemId + ",";
                if (cp.courseCategoryId) {
                  p.courseCategoryLst.push({
                    value: cp.courseCategoryId,
                    title: '',
                    money: cp.productPrice
                  })
                }
              });
            }

            //后期从订单信息外层获取
            p.itemIds = data.data.itemIds;

            p_list.push(p);
            p_id_list.push(p.productId);
          })
          p_list.push({ discount: {} })    //用于合计行
          that.product_index_last = p_list.length - 1;
          var t_list = [];
          var _category_list = [];
          data.data.orderInstalmentList.map(i => {
            //i.name = "第" + i.term + "期";
            i.payableDate = timestampToTime(i.payableDate);
            i.courseCategoryIds = [];
            i.courseCategoryNames = [];
            i.courseCategoryList = [];
            i.orderInstalmentCategoryList.map(j => {
              i.courseCategoryIds.push(j.courseCategoryId);
              i.courseCategoryNames.push(j.courseCategoryName)
              var isExist = false;
              for (var c = 0; c < _category_list.length; c++) {
                if (_category_list[c].value == j.courseCategoryId) {
                  isExist = true;
                  break;
                }
              }
              if (!isExist) {
                _category_list.push({
                  title: j.courseCategoryName,
                  value: j.courseCategoryId
                })
              }
              /*i.courseCategoryList.push({
                title: j.courseCategoryName,
                value: j.courseCategoryId
              })*/
              p_list.map(p => {
                if (p.courseCategoryLst) {
                  p.courseCategoryLst.map(c => {
                    if (c.value == j.courseCategoryId) {
                      c.title = j.courseCategoryName
                    }
                  })
                }
              })
            })
            t_list.push(i)
          })
          t_list.map(t => {
            t.courseCategoryList = _category_list
          })
          var discount_list = [];
          let discountIds = [];
          if (data.data.orderDiscountList) {
            data.data.orderDiscountList.map(d => {
              if (d.productDiscountType != 1) {
                var temp_d = {
                  productDiscountName: d.productDiscountName,
                  productDiscountType: d.productDiscountType,
                  productDiscountPrice: d.productDiscountPrice,
                  productDiscountId: d.productDiscountId,
                  key: d.productDiscountId
                }
                if(d.productDiscountType == 7){
                  temp_d.productDiscountPrice = d.discountAmount;
                }
                discount_list.push(temp_d);
                discountIds.push(d.productDiscountId);
              }
            })
          }
          discount_list.push({});
          discount_list.push({});
          this.discount_index_last = discount_list.length - 2;
          console.log(p_list)
          that.setState({
            dataModel: data.data,
            product_list: p_list,
            term_list: t_list,
            productIds: p_id_list,
            bz_discount_single_list: discount_list,
            discountIds: discountIds,
            stafflDiscountAmount: data.data.stafflDiscountAmount,
            term_num: t_list.length,
            payeeType: data.data.payeeType,
            // isCustomizeInstalment: data.data.isCustomizeInstalment ? '1' : '0'
          });
          
          that.calculateFee();
          
          setTimeout(function () {
            that.setTermMoneyByCategory(true);
          }, 200);
        }
        else {
          message.error(data.message);
        }
      })
    }
  }
  getMaxDiscountQuota() {
    if (!this.state.product_list || !this.state.product_list.length) {
      return;
    }
    var ids = [];
    this.state.product_list.map(p => {
      if (p.itemIds) {
        p.itemIds.split(',').map(id => {
          if (id) {
            var isExist = false;
            for (var i = 0; i < ids.length; i++) {
              if (ids[i] == id) {
                isExist = true;
                break;
              }
            }
            if (!isExist) {
              ids.push(id);
            }
          }
        })
      }
    });
    if (!ids.length) {
      return;
    }
    this.props.queryMaxDiscountQuotaByItems(ids.join(',')).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          staff_limit: parseFloat(data.data.discountPrice || 0),
          first_discount_scale: parseFloat(data.data.firstDiscountScale || 0)
        });
      }
      else {
        message.error(data.message);
      }
    })
  }

  //按 科目 计算 分期金额  <== 由原来的手动输入金额改为自动计算金额
  setTermMoneyByCategory(isEdit) {
    if (this.state.editMode == "OrderClassDirection") {
      return;
    }
    //由最初前端计算科目金额改为调取后台接口计算
    let params = {};
    params.discountJson = [];//优惠金额
    params.productJson = [];//商品金额
    var _moneyDiscount = 0;
    if(this.state.fee_list.length){
      _moneyDiscount = this.state.fee_list[0].totalOrderDiscountAmount;
      params.discountJson.push({discountAmount:_moneyDiscount})
    }
    this.state.product_list.map(p => {
      
      if (p.courseCategoryLst && p.courseCategoryLst.length) {
        let orderCourseProduct = {};
        orderCourseProduct.productAmount = p.productTotalPrice;
        orderCourseProduct.orderCourseProductJson = [];
        orderCourseProduct.productDiscountPrice = p.discount.productDiscountPrice || 100;

        if(this.props.orderId){//从订单管理进入
          if(p.productType == 2){//课程商品
            orderCourseProduct.orderCourseProductJson.push({
              productAmount: p.productTotalPrice,
              courseCategoryId: p.courseCategoryLst[0].value,
              courseCategoryName: p.courseCategoryLst[0].title
            })
          }else{//捆绑商品
            p.courseCategoryLst.map(pc => {
              orderCourseProduct.orderCourseProductJson.push({
                productAmount: pc.money,
                courseCategoryId: pc.value,
                courseCategoryName: pc.title
              })
            })
          }
        }else{//正常进入
          if(p.productType == 2){//课程商品
            orderCourseProduct.orderCourseProductJson.push({
              productAmount: p.productTotalPrice,
              courseCategoryId: p.courseCategoryLst[0].courseCategoryId,
              courseCategoryName: p.courseCategoryLst[0].name
            })
          }else{//捆绑商品
            p.productCoursePriceLst.map(pc => {
              for (var i = 0; i < p.courseCategoryLst.length; i++) {
                if (p.courseCategoryLst[i].courseCategoryId == pc.subjectId) {
                  pc.courseCategoryId = p.courseCategoryLst[i].courseCategoryId;
                  pc.courseCategoryName = p.courseCategoryLst[i].name;
                }
              }
              orderCourseProduct.orderCourseProductJson.push({
                productAmount: pc.coursePrice,
                courseCategoryId: pc.courseCategoryId,
                courseCategoryName: pc.courseCategoryName
              })
            })
          }
        }

        params.productJson.push(orderCourseProduct)
      }

    })

    params.discountJson = JSON.stringify(params.discountJson);
    params.productJson = JSON.stringify(params.productJson);
    //订单科目费用计算接口
    this.props.getCourseCategoryPrice(params).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {

        let _category_list = [];

        data.data.map(item => {
          _category_list.push({
            value: item.courseCategoryId,
            title: item.courseCategoryName,
            money: item.productAmount
          })
        })


        this.setState({
          category_money_list: _category_list
        })
      }
      else {
        message.error(data.message);
      }
    })


    return;

    //商品所属科目
    //商品上的折扣
    //整单优惠
    //员工特殊优惠
    var _category_list = [];  //最终 科目-金额 列表
    var _product_category_list = [];  //暂时 商品-科目-金额 列表
    var _moneyDiscount = 0;
    if(this.state.fee_list.length){
      _moneyDiscount = this.state.fee_list[0].totalOrderDiscountAmount;
    }
    //c.money -= parseFloat(_moneyDiscount * c.money / _moneyProduct).toFixed(2);
    this.state.product_list.map(p => {
      if (p.courseCategoryLst) {
        p.courseCategoryLst.map(c => {
          //if(_moneyDiscount > 0)
          _product_category_list.push({
            value: c.value,
            title: c.title,
            money: c.money,
            product: p.productId
          })
        });
      }
      if (p.discount && p.discount.productDiscountPrice) {
        if(p.productType == 1){
          var lastCategoryMony = 0;
          _product_category_list.map((m,k) => {
            if (m.product == p.productId) {
              if(k == (_product_category_list.length - 1)){
                m.money = parseFloat(p.productTotalPrice || 0) * parseFloat(p.discount.productDiscountPrice || 100) / 100 - lastCategoryMony;
              }else{
                m.money = parseFloat((m.money * p.discount.productDiscountPrice / 100).toFixed(2));
                lastCategoryMony += m.money;
              }
            }
          })
        }else{
          _product_category_list.map(m => {
            if (m.product == p.productId) {
              m.money = parseFloat((m.money * p.discount.productDiscountPrice / 100).toFixed(2));
            }
          })
        }
      }
    });
    if (!_product_category_list.length) {
      return;
    }

    //按金额排序（避免最后一个课程价格为0，造成计算误差）
    _product_category_list = _product_category_list.sort((a, b) => { 
      return a.money - b.money
    })

    var _moneyProduct = 0;
    
    _product_category_list.map(pc => {
      var isExist = false;
      for (var i = 0; i < _category_list.length; i++) {
        if (_category_list[i].value == pc.value) {
          _category_list[i].money += pc.money;
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        _category_list.push({
          value: pc.value,
          title: pc.title,
          money: pc.money
        })
      }
      _moneyProduct += pc.money;
    })
    if (!_moneyProduct) {
      message.error("按科目计算分期金额时，商品总金额为空");
      return;
    }
    if (this.state.fee_list.length) {
      var _moneyDiscount = this.state.fee_list[0].totalOrderDiscountAmount;
      if (_moneyDiscount > 0) {
        var totalMoney = this.state.fee_list[0].totalProductAmount;
        for(var i = 0; i < _category_list.length; i++){
          var c = _category_list[i];
          if(i == _category_list.length - 1){
            var lastMoney = totalMoney;
            for(var i = 0; i < _category_list.length - 1; i++) {
              lastMoney = lastMoney - _category_list[i].money;
            }
            c.money = parseFloat(lastMoney.toFixed(2));
          }else {
            c.money -= parseFloat(_moneyDiscount * c.money / _moneyProduct).toFixed(2);
          }
        }
      }
    }

    this.setState({
      category_money_list: _category_list
    })
  }

  //-------------选择商品----------------//
  onChooseProduct() {
    //个人订单 不需要选大客户
    if (this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      if (this.state.payeeType || this.state.dataModel.payeeType) {
        this.setState({ isShowChooseProduct: true })
      } else {
        message.error("请先选择一个收费方");
      }
      return;
    }
    if (this.refPartner) {
      var partnerId = this.refPartner.props.value;
      if (partnerId) {
        this.setState({ isShowChooseProduct: true, partnerId: partnerId })
        return;
      }
    }
    message.error("请先选择一个大客户");
  }

  //-------------选择优惠----------------//
  onChooseDiscount(flag) {
    
    //整单优惠查询增加参数
    this.setState({ discountType: 1,fullPriceCondition: null })
    if(flag){

      let fullPriceCondition = 0;

      if(this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 6 || a.productDiscountType == 7)).length > 0){
        message.error("满减优惠只能选择一个！");
        return;
      }

      var amount = 0;
      this.state.product_list.map(item => {
        var _money2 = parseFloat(item.productTotalPrice || 0) * parseFloat(item.discount.productDiscountPrice || 100) / 100;
        amount += parseFloat(_money2 || 0);
      })
      amount = Math.round(amount*100)/100;
      
      let _money = 0;
      this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 2 || a.productDiscountType == 3)).map(d => {
        _money += parseFloat(d.productDiscountPrice || 0);
      })
      _money = Math.round(_money*100)/100;
      fullPriceCondition = Math.round((amount - _money - this.state.stafflDiscountAmount)*100)/100;
      //满减优惠查询增加参数
      //满减优惠查询增加参数(订单总金额-折扣优惠总金额-整单优惠总金额 - 特殊优惠金额)
      this.setState({ discountType: 2,fullPriceCondition: fullPriceCondition })

    }

    //个人订单 不需要选大客户
    if (this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      if (this.state.payeeType || this.state.dataModel.payeeType) {
        this.setState({ isShowChooseDiscount: true })
      } else {
        message.error("请先选择一个收费方");
      }
      return;
    }

    if (this.refPartner) {
      var partnerId = this.refPartner.props.value;
      if (partnerId) {
        this.setState({ isShowChooseDiscount: true, partnerId: partnerId })
        return;
      }
    }

    if (this.state.productIds.length) {
        this.setState({ isShowChooseDiscount: true })

    }else{
        message.error("请先选择商品");
        return;
    }


  }


  setTermList(p_list){
    //设置 分期列表
    var _term_num = 0;
    p_list.map(p => {
      if (p.productTermPriceLst && _term_num < p.productTermPriceLst.length) {
        _term_num = p.productTermPriceLst.length;
      }
    })
    var t_list = [];
    if (_term_num > 0) {
      var d = new Date();
      for (var i = 0; i < _term_num; i++) {
        //{"term":1, "payableAmount":"50000", "payableDate":"2018-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92ad,a81acff846c111e89aa5f8bc129b92bb"},{"term":2, "payableAmount":"19100", "payableDate":"2019-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92cc"}
        var termInfo = {
          term: (i + 1),
          //name: "第" + (i+1) + "期",
          payableAmount: 0,
          payableDate: "",
          courseCategoryNames: [],
          courseCategoryIds: []
        };
        p_list.map(p => {
          if (p.productTermPriceLst && p.productTermPriceLst.length > i) {
            termInfo.payableAmount += parseFloat(p.productTermPriceLst[i].productTermPrice);
            termInfo.courseCategoryNames.push(p.productTermPriceLst[i].courseCategoryNames);
            termInfo.courseCategoryIds.push(p.productTermPriceLst[i].courseCategoryIds);
            d.setYear(1900 + d.getYear() + i);
            termInfo.payableDate = timestampToTime(d.valueOf());
            d = new Date();
          }
        })
        t_list.push(termInfo);
      }
    }
    return t_list;
  }

  //从优惠选择页 返回 //选择优惠框后执行
  onChoosedDiscount(discountList) {

    this.setState({
      isShowChooseDiscount: false,
    })
    var ids = this.state.discountIds;
    
    if (discountList.length < 1) {
      message.error("请选择一个优惠折扣");
      return;
    }
    //判断是否冲突
    for(var k=0; k<discountList.length; k++){
      if (discountList[k].discountMutexIds) {
        var mutexIds = discountList[k].discountMutexIds.split(',');
        for (var i = 0; i < this.state.bz_discount_single_list.length; i++) {
          var item = this.state.bz_discount_single_list[i];
          for (var j = 0; j < mutexIds.length; j++) {
            if (item.productDiscountId == mutexIds[j]) {
              message.error("此优惠折扣与已选优惠折扣有冲突，无法添加！");
              return;
            }
          }
        }
      }
    }

    var _list = this.state.bz_discount_single_list;
    //_list.push(this.choosed_discount_single);
    //_list.push({})
    //_list.push({})
    for(var k=0; k<discountList.length; k++){
      _list.splice(0, 0, discountList[k]);
      ids.splice(0,0,discountList[k].productDiscountId);
    }
    
    //去除满减优惠
    if(discountList[0].productDiscountType == 2 || discountList[0].productDiscountType == 3){

      if(this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 6 || a.productDiscountType == 7)).length){
        message.warning("优惠发生变动，如需满减优惠，请重新选择！");
      }

      let list = [], idsArr = [];
      _list.map((item) => {
        if(item.productDiscountType == 6 || item.productDiscountType == 7){
          
        }else{
          list.push(item);
          if(item.productDiscountId){
            idsArr.push(item.productDiscountId)
          }
        }
      })

      _list = list;
      ids = idsArr;

    }

    this.discount_index_last = _list.length - 2;
    this.setState({
      bz_discount_single_list: _list,
      discountIds: ids,
    })

    this.choosed_discount_single = null;
    this.isNeedResetTerm = true;
    this.calculateFee();
  }


  //从商品选择页 返回
  onChoosedProduct(productList, payeeType) {
    //message.error(productList);
    var that = this;
    if (this.refPartner) {
      var partnerId = this.refPartner.props.value;
    }
    var p_list = this.state.product_list;
    if (p_list.length) {
      p_list.splice(p_list.length - 1, 1);
    }
    var ids = this.state.productIds;
    productList.map(p => {
      if (that.state.editMode == 'OrderClassDirection') {
        p.partner_class_type = "方向班";
      } else {
        p.discount = {};
      }
      var isExist = false;
      for (var i = 0; i < p_list.length; i++) {
        if (p_list[i].productId == p.productId) {
          isExist = true;
          break;
        }
      }

      if (p.courseCategoryLst) {
        p.courseCategoryLst.map(cp => {
          var money = 0;
          if (p.productType == 2) {
            //课程商品，只能有一个商品
            money = p.productTotalPrice;
          } else if (p.productType == 1 && p.productCoursePriceLst) {
            //捆绑商品
            for (var i = 0; i < p.productCoursePriceLst.length; i++) {
              if (p.productCoursePriceLst[i].subjectId == cp.courseCategoryId) {
                money += p.productCoursePriceLst[i].coursePrice || 0;
              }
            }
          }
          cp.value = cp.courseCategoryId;
          cp.title = cp.name;
          cp.money = money;
        })

        //项目按价格排序
        p.courseCategoryLst = p.courseCategoryLst.sort((a, b) => { 
          return a.money - b.money
        })

      }
      if (!isExist) {
        p_list.push(p);
        ids.push(p.productId);
      }
    });

    var t_list = this.setTermList(p_list);

    p_list.push({ discount: {} })    //用于合计行
    this.product_index_last = p_list.length - 1;

    var temp_list = [{}, {}]
    this.discount_index_last = 0;
    //展现出来
    console.log(p_list)
    this.setState({
      term_list: t_list,
      product_list: p_list,
      productIds: ids,
      payeeType: payeeType,   //收费方

      isShowChooseProduct: false,
      disabledPartner: true,
      bz_discount_single_list: temp_list,
      discountIds: []
    })

    setTimeout(function () {
      that.calculateFee();
    }, 200);
  }
  onRemove(record, type) {
    var that = this;
    if (type == 1) {
      for (var i = 0; i < this.state.product_list.length; i++) {
        var item = this.state.product_list[i];
        if (item.productId == record.productId) {
          this.state.product_list.splice(i, 1);
          this.state.productIds.splice(i, 1);
          this.product_index_last = this.state.product_list.length - 1;
          this.setState({
            product_list: this.state.product_list,
            productIds: this.state.productIds
          })
          break;
        }
      }
      if (this.state.product_list.length <= 1) {
        for (var i = 0; i < this.state.product_list.length; i++) {
          var l = this.state.product_list[i];
          if (!l.productId) {
            this.state.product_list.splice(i, 1);
          }
        }
      }

      //修改商品 清空 优惠
      var temp_list = [{}, {}];
      this.discount_index_last = temp_list.length - 2;
      if (!this.state.productIds.length) {
        //商品数大于1，不能改大客户
        this.setState({
          disabledPartner: false,
          bz_discount_single_list: temp_list,
        })
      } else {
        this.setState({
          bz_discount_single_list: temp_list,
        });
      }
      this.setState({
        discountIds: []
      })
    } else {
      for (var i = 0; i < this.state.bz_discount_single_list.length; i++) {
        var item = this.state.bz_discount_single_list[i];
        if (item.productDiscountId == record.productDiscountId) {
          this.state.bz_discount_single_list.splice(i, 1);
          this.state.discountIds.splice(i, 1);
          this.setState({
            bz_discount_single_list: this.state.bz_discount_single_list,
            discountIds: this.state.discountIds
          })
          break;
        }
      }

      if (this.discount_index_last > 0) {
        this.discount_index_last -= 1;
      }

      //去除满减优惠
      if(record.productDiscountType == 2 || record.productDiscountType == 3 ){

        if(this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 6 || a.productDiscountType == 7)).length){
          message.warning("优惠发生变动，如需满减优惠，请重新选择！");
        }

        let list = [], ids = [];
        this.state.bz_discount_single_list.map((item) => {
          if(item.productDiscountType == 6 || item.productDiscountType == 7){
            
          }else{
            list.push(item);
            if(item.productDiscountId){
              ids.push(item.productDiscountId)
            }
          }
        })

        this.discount_index_last = list.length - 2;
        this.setState({
          bz_discount_single_list: list,
          discountIds: ids,
        })
      }

    }

    var p_list = this.state.product_list;
    var t_list = this.setTermList(p_list);
    this.setState({
      term_list: t_list,
    })
    setTimeout(function () {
      that.calculateFee();
    }, 200);
  }


  onHideModal() {
    this.setState({
      isShowChooseProduct: false,
      isShowChooseDiscount: false,
      isShowProductDetail: false
    })
  }

  //用于商品列表  合并单元格
  productRenderContent = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };
    if (index === this.product_index_last) {
      obj.props.colSpan = 0;
    }
    return obj;
  };
  //table 输出列定义
  columns_product = [
    {
      title: '商品名称',
      width: 180,//可预知的数据长度，请设定固定宽度
      //fixed: 'left',
      dataIndex: 'productName',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <div><a onClick={() => { 
            this.setState({productDetail:record});
            setTimeout(()=>{
                this.setState({isShowProductDetail:true});
            },300)
            
           }}>{value}</a></div>
        }
        return {
          children: <span>合计：</span>,
          props: {
            colSpan: 3,
          },
        }
      }
    },
    {
      title: '班型',
      dataIndex: 'classTypeName',
      render: this.productRenderContent,
    },
    {
      title: '合作方式',
      dataIndex: 'partner_class_type',
      render: this.productRenderContent,
    },
    {
      title: '标准金额（¥）',
      dataIndex: 'productTotalPrice',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <span>{formatMoney(value || 0)}</span>
        }
        var amount = 0;
        this.state.product_list.map(item => {
          amount += parseFloat(item.productTotalPrice || 0);
        })
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '缴费分期',
      dataIndex: 'terms',
    },
    {
      title: '当期金额（¥）',
      render: (value, record, index) => {
        
        // var _money = record.productTermPriceLst && record.productTermPriceLst.length ? record.productTermPriceLst[0].productTermPrice : 0;
        var _money = record.productFirstTermPrice || (record.productTermPriceLst && record.productTermPriceLst.length ? record.productTermPriceLst[0].productTermPrice : 0) || 0;
        if (index < this.product_index_last) {
          return <span>{formatMoney(_money)}</span>
        }
        var amount = 0;
        this.state.product_list.map(item => {
          //var _money2 = item.terms ? item.productTotalPrice / item.terms : item.productTotalPrice;
          // var _money2 = item.productTermPriceLst && item.productTermPriceLst.length ? item.productTermPriceLst[0].productTermPrice : 0;
          var _money2 = item.productFirstTermPrice || (item.productTermPriceLst && item.productTermPriceLst.length ? item.productTermPriceLst[0].productTermPrice : 0) || 0;
          amount += parseFloat(_money2 || 0);
        })
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '操作',
      width: 120,//可预知的数据长度，请设定固定宽度
      fixed: 'right',
      key: 'action',
      render: (text, record, index) => {
        if (index < this.product_index_last) {
          return <Button onClick={() => { this.onRemove(record, 1) }}>删除</Button>
        }
      },
    }
  ];

  columns_product_amateur = [
    {
      title: '商品名称',
      width: 180,//可预知的数据长度，请设定固定宽度
      //fixed: 'left',
      dataIndex: 'productName',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <div><a onClick={() => { 
            this.setState({productDetail:record});
            setTimeout(()=>{
                this.setState({isShowProductDetail:true});
            },300)
           }}>{value}</a></div>
        }
        return {
          children: <span>合计：</span>,
          props: {
            colSpan: 3,
          },
        }
      }
    },
    {
      title: '班型',
      dataIndex: 'classTypeName',
      render: this.productRenderContent,
    },
    {
      title: '价格来源',
      dataIndex: 'orgType',
      //render: this.productRenderContent,
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <span>{value == "1" ? "总部" : value == "3" ? "分部" : value == "4" ? "大客户" : "其他"}</span>
        }
        return {
          children: '', props: { colSpan: 0 }
        }
      }
    },
    {
      title: '标准金额（¥）',
      dataIndex: 'productTotalPrice',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <span>{formatMoney(value || 0)}</span>
        }
        var amount = 0;
        this.state.product_list.map(item => {
          amount += parseFloat(item.productTotalPrice || 0);
        })
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '折扣优惠',
      width: 150,
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <SelectDiscount
            //style={{width: 200}}
            value={record.productDiscountId}
            title={record.productDiscountName}
            isShowSelect={true}
            isAutoSearch={true}
            productIds={record.productId}
            setChooseValueChange={(value, obj) => this.onDiscountChange(value, obj, record)}
          />
        }
        return <span></span>
      }
    },
    {
      title: '折扣',
      //dataIndex: 'discount.productDiscountPrice',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          return <span key={index}>{record.discount.productDiscountPrice || 100}%</span>
        }
      }
    },
    {
      title: '折扣优惠金额（¥）',
      //dataIndex: 'discount.productDiscountPrice',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          var _money = parseFloat(record.productTotalPrice || 0) - parseFloat(record.productTotalPrice || 0) * parseFloat(record.discount.productDiscountPrice || 100) / 100;
          _money = Math.round(_money*100)/100;
          return <span key={index}>{formatMoney(_money)}</span>
        }
        var amount = 0;
        this.state.product_list.map(item => {
          var _money2 = parseFloat(item.productTotalPrice || 0) - parseFloat(item.productTotalPrice || 0) * parseFloat(item.discount.productDiscountPrice || 100) / 100;
          amount += parseFloat(_money2 || 0);
        })
        amount = Math.round(amount*100)/100;
        var _k = `_${index}`
        return <span key={_k}>{formatMoney(amount)}</span>
      }
    },
    {
      title: '实际金额（¥）',
      render: (value, record, index) => {
        if (index < this.product_index_last) {
          var _money = parseFloat(record.productTotalPrice || 0) * parseFloat(record.discount.productDiscountPrice || 100) / 100;
          _money = Math.round(_money*100)/100;
          return <span>{formatMoney(_money)}</span>
        }
        var amount = 0;
        this.state.product_list.map(item => {
          var _money2 = parseFloat(item.productTotalPrice || 0) * parseFloat(item.discount.productDiscountPrice || 100) / 100;
          amount += parseFloat(_money2 || 0);
        })
        amount = Math.round(amount*100)/100;
        return <span>{formatMoney(amount)}</span>
      }
    },
    {
      title: '操作',
      width: 120,//可预知的数据长度，请设定固定宽度
      fixed: 'right',
      key: 'action',
      render: (text, record, index) => {
        if (index < this.product_index_last) {
          return <Button onClick={() => { this.onRemove(record, 1) }}>删除</Button>
        }
      },
    }
  ];

  //----------折扣-----------优惠---------------//
  onAddDiscountSingle() {
    if (!this.choosed_discount_single) {
      message.error("请选择一个优惠折扣")
      return;
    }
    //判断是否冲突
    if (this.choosed_discount_single.discountMutexIds) {
      var mutexIds = this.choosed_discount_single.discountMutexIds.split(',');
      for (var i = 0; i < this.state.bz_discount_single_list.length; i++) {
        var item = this.state.bz_discount_single_list[i];
        for (var j = 0; j < mutexIds.length; j++) {
          if (item.productDiscountId == mutexIds[j]) {
            message.error("此优惠折扣与已选优惠折扣有冲突，无法添加！")
            return;
          }
        }
      }
    }

    var _list = this.state.bz_discount_single_list;
    //_list.push(this.choosed_discount_single);
    //_list.push({})
    //_list.push({})
    _list.splice(0, 0, this.choosed_discount_single);
    this.discount_index_last = _list.length - 2;
    this.setState({
      bz_discount_single_list: _list
    })
    this.choosed_discount_single = null;

    this.calculateFee();
  }



  //用于整单优惠列表  合并单元格
  discountRenderContent = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };
    if (index >= this.discount_index_last) {
      obj.props.colSpan = 0;
    }
    return obj;
  };
  columns_discount = [
    {
      title: '优惠名称',
      dataIndex: 'productDiscountName',
      render: (value, record, index) => {
        if (index < this.discount_index_last) {
          return <span>{value}</span>
        }
        else if (index == this.discount_index_last) {
          return {
            children: <span>员工特殊优惠：</span>,
            props: { colSpan: 2 }
          }
        }
        return {
          children: <span>优惠金额（¥）：</span>,
          props: { colSpan: 2 }
        }
      }
    },
    {
      title: '优惠类型',
      dataIndex: 'productDiscountType',
      //render: text => <span>{getDictionaryTitle(this.state.discount_type, text)}</span>
      render: (value, record, index) => {
        if (index < this.discount_index_last) {
          return <span>{getDictionaryTitle(this.state.discount_type, value)}</span>
        } else {
          return {
            children: <span></span>,
            props: { colSpan: 0 }
          }
        }
      }
    },
    {
      title: '优惠金额',
      dataIndex: 'productDiscountPrice',
      //render: text => <span>{formatMoney(text)}</span>
      render: (value, record, index) => {
        if (index < this.discount_index_last) {
          return <span>{formatMoney(value || 0)}</span>
        } else if (index == this.discount_index_last) {
          return {
            children: <div>
              <NumericInput value={this.state.stafflDiscountAmount} onChange={this.onDiscountNumberChange} />
              <span>【最高限额{this.state.staff_limit}元】</span>
            </div>,
            props: { colSpan: 2 }
          }
        } else {
          var _money = 0;
          this.state.bz_discount_single_list.map(d => {
            _money += parseFloat(d.productDiscountPrice || 0);
          })
          return {
            children: <span>{formatMoney(_money + parseFloat(this.state.stafflDiscountAmount || 0))}</span>,
            props: { colSpan: 2 }
          }
        }
      }
    },
    {
      title: '操作',
      render: (text, record, index) => {
        if (index < this.discount_index_last) {
          return <Button onClick={() => { this.onRemove(record, 2) }}>删除</Button>
        } else {
          return {
            children: <span></span>,
            props: { colSpan: 0 }
          }
        }
      },
    }
  ];

  //----------费用-----------//

  calculateFee() {
    var that = this;
    if (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {

    } else {
      return;
    }
    var fee_list = [];
    var _total = 0;
    var _discount_percent = 0;    //折扣优惠金额
    var _discount_money = 0;      //现金优惠金额
    var _order = 0;
    this.state.product_list.map(p => {
      var total = parseFloat(p.productTotalPrice || 0);
      var actual = parseFloat(p.productTotalPrice || 0) * parseFloat(p.discount.productDiscountPrice || 100) / 100;
      _total += total;
      _discount_percent += total - actual;
      _order += actual;
    })
    this.state.bz_discount_single_list.map(d => {
      _discount_money += parseFloat(d.productDiscountPrice || 0);
    })
    _discount_money += parseFloat(this.state.stafflDiscountAmount || 0)
    _order -= _discount_money;
    fee_list.push({
      totalInitialAmount: Math.round(_total*100)/100,
      totalProductDiscountAmount: Math.round(_discount_percent*100)/100,
      totalOrderDiscountAmount: Math.round(_discount_money*100)/100,
      totalProductAmount: Math.round(_order*100)/100,
    })
    this.setState({
      fee_list: fee_list,
    });

    if (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      if (this.state.term_list && this.state.term_list.length) {
        var shouldUpdate = true;
        for (var t of this.state.term_list) {
          if (!t.payableAmount) {
            shouldUpdate = false;
            break;
          }
        }
        if (shouldUpdate) {
          var totalAmount = _order;
          //修改 最后一期的钱
          var _tempAmount = 0;
          for (var i = 0; i < this.state.term_list.length - 1; i++) {
            var t = this.state.term_list[i];
            _tempAmount += t.payableAmount;
          }
          this.state.term_list[this.state.term_list.length - 1].payableAmount = totalAmount - _tempAmount;
        }
      }
      setTimeout(function () {
        that.getMaxDiscountQuota();
        that.onButtonChooseTerm();
      }, 200);
    }
  }

  columns_fee = [
    {
      title: '订单标准金额（¥）',
      dataIndex: 'totalInitialAmount',
      render: text => <span>{formatMoney(text)}</span>
    },
    {
      title: '折扣优惠金额（¥）',
      dataIndex: 'totalProductDiscountAmount',
      render: text => <span>{formatMoney(text)}</span>
    },
    {
      title: '现金优惠金额（¥）',
      dataIndex: 'totalOrderDiscountAmount',
      render: text => <span>{formatMoney(text)}</span>
    },
    {
      title: '实际应缴金额（¥）',
      dataIndex: 'totalProductAmount',
      render: text => <span>{formatMoney(text)}</span>
    },
    {
      title: '收费方',
      //dataIndex: 'payType',
      //render: text => <span>{formatMoney(text)}</span>
      render: (text, record, index) => {
        return <span>{getDictionaryTitle(this.state.payee_type, this.state.payeeType)}</span>
      }
    }
  ];

  //----------分期付款-----------//
  columns_term = [
    {
      title: '分期',
      dataIndex: 'term',
      width: 80,
      render: text => <span>第{text}期</span>
    },
    {
      title: '开通科目',
      //dataIndex: 'courseCategoryNames',
      //width: 500,
      render: (text, record) => {
        if (this.state.editMode == "OrderClassDirection") {
          return <span>{record.courseCategoryNames.join('、')}</span>
        }
        if (this.state.term_list.length == 1) {
          return <Checkbox.Group value={record.courseCategoryIds} disabled>
            {
              record.courseCategoryList.sort((a, b) => { return 
                  if(a.title < b.title) {
                      return -1;
                  } else if(a.title > b.title) {
                      return 1;
                  } else {
                      return 0;
                  }
               }).map((item, index) => {
                return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
              })
            }
          </Checkbox.Group>
        }
        return <Checkbox.Group value={record.courseCategoryIds}
          onChange={(value) => this.onCourseCategoryChange(value, record.term)}
        >
          {
            record.courseCategoryList.sort((a, b) => { 
                if(a.title < b.title) {
                    return -1;
                } else if(a.title > b.title) {
                    return 1;
                } else {
                    return 0;
                }
             }).map((item, index) => {
              return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
            })
          }
        </Checkbox.Group>
      }
    },
    {
      title: '缴费日期',
      dataIndex: 'payableDate',
      width: 120,
      render: (text, record) => {
        return record.payableDate ? <DatePicker value={moment(record.payableDate, dateFormat)} format={dateFormat} onChange={(value) => this.onDateChange(value, record)} disabledDate={this.disabledPayableDate} />
          : <DatePicker format={dateFormat} onChange={(value) => this.onDateChange(value, record)} disabledDate={this.disabledPayableDate} />
      }
    },
    {
      title: '分期缴费金额',
      width: 120,
      dataIndex: 'payableAmount',
      render: (text, record, index) => {
        return <span>{formatMoney(text)}</span>
        /*if(this.state.editMode == "OrderClassDirection"){
          return <span>{formatMoney(text)}</span>
        }
        if(index == this.state.term_list.length - 1){
          return <span>{formatMoney(text)}</span>
        }
        return <NumericInput value={record.payableAmount} onChange={(value) => this.onMoneyNumberChange(value, record.term)}/>
        */
      }
    },
  ];

  columns_term_custom = [
    {
      title: '分期',
      dataIndex: 'term',
      width: 80,
      render: text => <span>第{text}期</span>
    },
    {
      title: '开通科目',
      //dataIndex: 'courseCategoryNames',
      //width: 500,
      render: (text, record) => {
        if (this.state.editMode == "OrderClassDirection") {
          return <span>{record.courseCategoryNames.join('、')}</span>
        }
        if (this.state.term_list.length == 1) {
          return <Checkbox.Group value={record.courseCategoryIds} disabled>
            {
              record.courseCategoryList.sort((a, b) => { return 
                  if(a.title < b.title) {
                      return -1;
                  } else if(a.title > b.title) {
                      return 1;
                  } else {
                      return 0;
                  }
               }).map((item, index) => {
                return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
              })
            }
          </Checkbox.Group>
        }
        return <Checkbox.Group value={record.courseCategoryIds}
          onChange={(value) => this.onCourseCategoryChange(value, record.term)}
        >
          {
            record.courseCategoryList.sort((a, b) => { 
                if(a.title < b.title) {
                    return -1;
                } else if(a.title > b.title) {
                    return 1;
                } else {
                    return 0;
                }
             }).map((item, index) => {
              return <Checkbox value={item.value.toString()} key={index}>{item.title}</Checkbox>
            })
          }
        </Checkbox.Group>
      }
    },
    {
      title: '缴费日期',
      dataIndex: 'payableDate',
      width: 120,
      render: (text, record) => {
        // return record.payableDate ? <DatePicker value={moment(record.payableDate, dateFormat)} format={dateFormat} onChange={(value) => this.onDateChange(value, record)} disabledDate={this.disabledPayableDate} />
        //   : <DatePicker format={dateFormat} onChange={(value) => this.onDateChange(value, record)} disabledDate={this.disabledPayableDate} />
        return record.payableDate ? <DatePicker value={moment(record.payableDate, dateFormat)} format={dateFormat} onChange={(value) => this.onDateChange(value, record)} />
          : <DatePicker value='' format={dateFormat} onChange={(value) => this.onDateChange(value, record)} />
      }
    },
    {
      title: '分期缴费金额',
      width: 120,
      dataIndex: 'payableAmount',
      render: (text, record, index) => {
        // <span>{formatMoney(text)}</span>
        
        if(index == this.state.term_list.length - 1){
          return <Input
                    value={text}
                    disabled
                    maxLength="25"
                    style={{ width: '120px' }}
                  />
        }
        return <NumericInput value={text} onChange={(value) => this.onMoneyNumberChange(value, record.term)} />
        
      }
    },
  ];

  //-------------
  //商品上优惠下拉
  onDiscountChange(value, obj, record) {
    if (obj) {
      for (var i = 0; i < this.state.product_list.length; i++) {
        var item = this.state.product_list[i];
        if (item.productId == record.productId) {
          item.discount = obj;
          break;
        }
      };
      this.setState({
        product_list: this.state.product_list
      })
    }

    if(this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 6 || a.productDiscountType == 7)).length){
      message.warning("优惠发生变动，如需满减优惠，请重新选择！");
    }

    //去除满减优惠
    let list = [], ids = [];
    this.state.bz_discount_single_list.map((item) => {
      if(item.productDiscountType == 6 || item.productDiscountType == 7){
        
      }else{
        list.push(item);
        if(item.productDiscountId){
          ids.push(item.productDiscountId)
        }
      }
    })

    this.discount_index_last = list.length - 2;
    this.setState({
      bz_discount_single_list: list,
      discountIds: ids,
    })

    this.isNeedResetTerm = true;
    this.calculateFee();
  }
  //员工优惠输入框
  onDiscountNumberChange(value) {
    /*if(parseFloat(value) < 200){
      message.error("员工特殊优惠限额200");
      value = 200;
      //这里不用判断，高于限额的总部会审核
    }*/ 
    if(Number(value)<0)return message.warning('请输入正确的优惠金额')
    this.setState({
      stafflDiscountAmount: value
    });
    this.isNeedResetTerm = true;

    //去除满减优惠
    if(this.state.bz_discount_single_list.filter(a => (a.productDiscountType == 6 || a.productDiscountType == 7)).length){
      message.warning("优惠发生变动，如需满减优惠，请重新选择！");
    }

    let list = [], ids = [];
    this.state.bz_discount_single_list.map((item) => {
      if(item.productDiscountType == 6 || item.productDiscountType == 7){
        
      }else{
        list.push(item);
        if(item.productDiscountId){
          ids.push(item.productDiscountId)
        }
      }
    })

    this.discount_index_last = list.length - 2;
    this.setState({
      bz_discount_single_list: list,
      discountIds: ids,
    })

    var that = this;
    setTimeout(function () {
      that.calculateFee();
    }, 200)
  }
  onMoneyNumberChange(value, term) {
    var curr = null;
    //最终实缴金额
    var totalAmount = this.state.fee_list[0].totalProductAmount;
    var _tempAmount = 0;
    for (var i = 0; i < this.state.term_list.length - 1; i++) {
      var item = this.state.term_list[i];
      if (item.term == term) {
        item.payableAmount = parseFloat(value || 0);
        curr = item;
      }
      _tempAmount += parseFloat(item.payableAmount || 0);
    }
    if (_tempAmount > totalAmount) {
      curr.payableAmount = 0;
    } else {
      curr.payableAmount = value;
    }

    var existNull = false;
    for (var i = 0; i < this.state.term_list.length - 1; i++) {
      var item = this.state.term_list[i];
      if (item.payableAmount <= 0) {
        existNull = true;
        break;
      }
    }
    if (!existNull) {
      this.state.term_list[this.state.term_list.length - 1].payableAmount = Math.round((totalAmount - _tempAmount)*100)/100;
    }

    if (term == 1) {
      this.state.dataModel.payableAmount = curr.payableAmount;
      this.setState({
        dataModel: this.state.dataModel,
        term_list: this.state.term_list
      });
    } else {
      this.setState({
        term_list: this.state.term_list
      });
    }

  }
  //非方向班 自主选择分期
  onSelectTermChange(value, e) {
    //this.state.term_num = value;
    this.setState({
      term_num: value
    })
  }
  //对选择的分期确认
  onButtonChooseTerm(isUserClick) {
    var that = this;
    var num = this.state.term_num;
    if (parseInt(num) <= 0) {
      message.error("请选择一个有效分期数")
      return;
    }
    if (!isUserClick) {
      //修改订单，自动加载 term_list
      if (this.state.term_list
        && this.state.term_list.length
      ) {
        var d = this.state.dataModel;
        d.payableAmount = this.state.term_list[0].payableAmount;
        this.setState({
          dataModel: d
        })
      }
      if (this.state.dataModel.orderId) {
        //这里不能返回，原因是 如果某一个商品 选了一个 折扣，那么只影响到最后一期 是有问题的
        if(!this.isNeedResetTerm){
          return;
        }
      }
    }
    //查项目的并集
    var item_id_list = [];
    this.state.product_list.map(p => {
      if (p.itemIds) {
        p.itemIds.split(',').map(id => {
          if (id) {
            var isExist = false;
            for (var i = 0; i < item_id_list.length; i++) {
              if (item_id_list[i] == id) {
                isExist = true;
                break;
              }
            }
            if (!isExist) {
              item_id_list.push(id);
            }
          }
        })
      }
    })

    var _courseCategoryList = [];
    var _ids = [];
    
    this.state.product_list.map(p => {
      if (p.courseCategoryLst && p.courseCategoryLst.length) {
        p.courseCategoryLst.map(c => {
          var isExist = false;
          for (var i = 0; i < _courseCategoryList.length; i++) {
            if (_courseCategoryList[i].value == c.value) {
              isExist = true;
              break;
            }
          }
        

          if (!isExist) {
            _courseCategoryList.push({
              value: c.value,
              title: c.title,
              money: c.money
            })
            _ids.push(c.value.toString())
          }
        })
      }
    })
    
    if (num > _courseCategoryList.length) {
      message.error("分期数不能大于开通科目数！")
      return;
    }

    if (!this.state.fee_list.length) {
      return;
    }
    var _amount = this.state.fee_list[0].totalProductAmount;
    var term_list = [];
    var d = new Date();
    for (var i = 0; i < num; i++) {
      d.setYear(1900 + d.getYear() + i);
      //termInfo.payableDate = timestampToTime(d.valueOf());
      var termInfo = {
        term: (i + 1),
        payableAmount: num == 1 ? _amount : 0,
        payableDate: this.state.isCustomizeInstalment == '0'? timestampToTime(d.valueOf()) : null,
        //courseCategoryNames: [],
        courseCategoryIds: num == 1 ? _ids : [],
        courseCategoryList: _courseCategoryList,
      };
      term_list.push(termInfo)
      d = new Date();
    }
    if (num == 1) {
      var d = this.state.dataModel;
      d.payableAmount = _amount;
      this.setState({
        term_list: term_list,
        dataModel: d
      })
    } else {
      this.setState({
        term_list: term_list
      })
    }

    setTimeout(function () {
      that.setTermMoneyByCategory();
    }, 200);
  }
  checkAllCategoryChoosed(){
    if(this.state.term_list.length > 0){
      //2018-08-08 判断 如果 所有科目都选上了，那么就把最后一期的金额 = 总额 - 前几期之和
      var isAllCategoryChoosed = true;  //是否所有科目都选上了
      var all_category_list = this.state.term_list[0].courseCategoryList;
      for(var a = 0; a < all_category_list.length; a++){
        var c = all_category_list[a];
        var isExist = false;
        for(var i = 0; i < this.state.term_list.length; i++){
          var cIds = this.state.term_list[i].courseCategoryIds;
          cIds.map(id => {
            if(c.value == id){
              isExist = true;
            }
          })
          if(isExist){
            break;
          }
        }
        if(!isExist){
          isAllCategoryChoosed = false;
          break;
        }
      }
      return isAllCategoryChoosed;
    }
    return false;
  }
  //开通科目 Checkbox 修改触发
  onCourseCategoryChange(value, term) {
    var that = this;
    var curr = null;
    for (var i = 0; i < this.state.term_list.length; i++) {
      var t = this.state.term_list[i];
      if (t.term == term) {
        curr = t;
        //break;
      } else {
        if (t.courseCategoryIds && value.length) {
          for (var id1 of t.courseCategoryIds) {
            for (var id2 of value) {
              if (id1 == id2) {
                message.error("同一开通科目不能在多个分期中！")
                return;
              }
            }

          }
        }
      }
    }
    curr.courseCategoryIds = value;

    if(this.state.isCustomizeInstalment == '0'){

      that.state.term_list.map(t => {
        if (t.courseCategoryIds && t.courseCategoryIds.length) {
          t.payableAmount = 0;
          t.courseCategoryIds.map(id => {
            this.state.category_money_list.map(c => {
              if (id == c.value) {
                t.payableAmount += c.money;
              }
            });
          })
        } else {
          t.payableAmount = 0;
        }
      })

    }
    

    var isAllCategoryChoosed = this.checkAllCategoryChoosed();
    if(isAllCategoryChoosed){
      //所有科目都选上了
      var lastTerm = this.state.term_list[this.state.term_list.length - 1];
      var totalMoney = this.state.fee_list[0].totalProductAmount;
      var lastMoney = totalMoney;
      for(var i = 0; i < this.state.term_list.length - 1; i++) {
        lastMoney = lastMoney - this.state.term_list[i].payableAmount
      }
      lastTerm.payableAmount = parseFloat(lastMoney.toFixed(2));
    }

    this.state.term_list.map(item => {
      item.payableAmount = Math.round(item.payableAmount*100)/100;
    })

    this.setState({
      term_list: this.state.term_list
    })
  }

  onDateChange(value, record) {
    this.state.term_list.map(p => {
      if (record.term == p.term) {
        record.payableDate = formatMoment(value, dateFormat);
      }
    })
    this.setState({
      term_list: this.state.term_list
    })
  }
  disabledPayableDate(value) {
    var d = ((new Date()).getTime() - 24 * 60 * 60 * 1000).valueOf();
    if (value < d) {
      return true;
    }
    return false;
  }

  onCancel = () => {
    this.props.viewCallback();
    return;
    var editMode = this.props.editMode;
    if (editMode) {
      editMode = editMode.replace('Order', 'Edit');
      this.props.viewCallback(null, editMode);
    } else {
      this.props.viewCallback();
    }
  }
  checkAndFillData(values, callback) {
    var that = this;
    values.studentId = this.state.dataModel.studentId;
    values.orderId = this.state.dataModel.orderId;
    values.orderProductJson = [];
    if(this.state.editMode == "OrderClassDirection"){
      this.state.productIds.map(i => {
        this.state.product_list.map(p => {
          if(p.productId && i == p.productId){
            values.orderProductJson.push({
              productId: i,
              productPriceId: p.productPriceId
            })
          }
        });
      });
    }else{
      this.state.productIds.map(i => {
        values.orderProductJson.push({
          productId: i
        })
      });
    }
    
    values.orderProductJson = JSON.stringify(values.orderProductJson);

    if (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      // if (!this.state.fee_list || !this.state.fee_list.length || !this.state.fee_list[0].totalProductAmount) {
      if (!this.state.fee_list || !this.state.fee_list.length) {
        message.error("没有实际应缴金额，请检查！");
        that.setState({ loading: false });
        return null;
      }
      if (!this.state.term_list || !this.state.term_list.length) {
        message.error("没有设置缴费分期，请检查！")
        that.setState({ loading: false });
        return null;
      }
      for (var i = 0; i < this.state.term_list.length; i++) {
        var t = this.state.term_list[i];
        if(this.state.fee_list[0].totalProductAmount == 0){
          
        }else{
          if (!(t.payableAmount*1)) {
            message.error("分期交费金额为空，请检查！");
            that.setState({ loading: false });
            return null;
          }
        }
        if (!t.payableDate) {
          message.error("分期交费日期为空，请检查！");
          that.setState({ loading: false });
          return null;
        }
        if (i > 0 && t.payableDate < this.state.term_list[i - 1].payableDate) {
          message.error("下一期缴费日期要大于上一期的");
          that.setState({ loading: false });
          return null;
        }
        if (!t.courseCategoryIds || !t.courseCategoryIds.length) {
          message.error("分期缴费未设置开通科目，请检查！")
          that.setState({ loading: false });
          return null;
        }
      }
      if(this.state.isCustomizeInstalment == '1'){
        if(this.state.term_list.length > 1){
          var firstPayableAmount = 0;
          this.state.term_list[0].courseCategoryIds.map(id => {
            this.state.category_money_list.map(c => {
              if (id == c.value) {
                firstPayableAmount += c.money;
              }
            });
          })
          if(this.state.term_list[0].payableAmount < firstPayableAmount){
            message.error("首期金额小于本期科目总额，请核对后重试！");
            that.setState({ loading: false });
            return null;
          }
        }

        if(this.state.editMode != "OrderClassDirection" && this.state.term_list.length > 1){
          for(var i=0;i<this.state.term_list.length;i++){
            let listMoney = 0;
            this.state.category_money_list.map((list) => {
              if(this.state.term_list[i].courseCategoryIds.indexOf(list.value) > -1){
                listMoney += list.money
              }
            })
            listMoney = Math.round(listMoney*100)/100;
            if(listMoney == 0){
              message.error("您设置的第"+(i+1)+"期所选科目总价格为0，请核对后重试！")
              that.setState({ loading: false });
              return null;
            }
          }

        }
        
      }
      //[{\"productDiscountId\":\"39ef72f749bf11e89aa5f8bc129b92ad\",\"productId\":\"1000020\"},{\"productDiscountId\":\"4c3757f749bf11e89aa5f8bc129b92ad\"},{\"productDiscountId\":\"516ebdaf49f911e89aa5f8bc129b92ad\"}]
      var orderDiscountJson = [];
      if (this.state.bz_discount_single_list && this.state.bz_discount_single_list.length) {
        this.state.bz_discount_single_list.map(d => {
          if (d.productDiscountId) {
            orderDiscountJson.push({
              productDiscountId: d.productDiscountId
            })
          }
        })
      }
      if (this.state.product_list && this.state.product_list.length) {
        this.state.product_list.map(p => {
          if (p.discount && p.discount.productDiscountId) {
            orderDiscountJson.push({
              productDiscountId: p.discount.productDiscountId,
              productId: p.productId
            })
          }
        })
      }
      values.orderDiscountJson = JSON.stringify(orderDiscountJson);

      values.stafflDiscountAmount = this.state.stafflDiscountAmount;
    }
    var orderInstalmentJson = [];
    //{"term":1, "payableAmount":"50000", "payableDate":"2018-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92ad,a81acff846c111e89aa5f8bc129b92bb"},{"term":2, "payableAmount":"19100", "payableDate":"2019-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92cc"}
    this.state.term_list.map(i => {
      orderInstalmentJson.push({
        term: i.term, payableAmount: i.payableAmount, payableDate: i.payableDate,
        courseCategoryIds: i.courseCategoryIds.join(',')
      })
    });
    values.orderInstalmentJson = JSON.stringify(orderInstalmentJson);
    //订单类型：1中博订单(个人订单);2大客户订单
    if (this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      values.orderType = 1;
      //个人订单 values里已有收费方了
    } else {
      values.orderType = 2;
      //方向班 业余班 设置 收费方
      values.payeeType = this.state.payeeType;
    }
    //大客户班级类型：1方向班;2精英班（大客户必填）
    if (this.state.editMode == "OrderClassDirection") {
      values.partnerClassType = 1;
    } else if (this.state.editMode == "OrderClassAmateur") {
      values.partnerClassType = 2;
    }

    if (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") {
      
      values.isCustomizeInstalment = this.state.isCustomizeInstalment;

      var isAllCategoryChoosed = this.checkAllCategoryChoosed();
      if(!isAllCategoryChoosed){
        message.error("有未选的科目！");
        that.setState({ loading: false });
        return null;
      }
      var content = "";
      var contentTitle = "此订单需要上级审核，审核原因：";
      if (orderInstalmentJson.length > 1) {
        content += '分期付款。     \n';
      }
      //var _half_fee = this.state.fee_list[0].totalProductAmount / 2;
      var _half_fee = 0;
      if (this.state.first_discount_scale > 0) {
        _half_fee = this.state.fee_list[0].totalProductAmount * this.state.first_discount_scale / 100;
      }
      if (orderInstalmentJson[0].payableAmount < _half_fee) {
        content += '分期付款、首付款比例低于总部要求比例' + this.state.first_discount_scale + '%（¥' + formatMoney(_half_fee) + '）。     \n';
      }
      if (parseFloat(this.state.stafflDiscountAmount) > this.state.staff_limit) {
        content += '员工特殊优惠金额高于员工限额。     \n';
      }
      if (this.state.fee_list[0].totalProductAmount == 0) {
        content += '免单。     \n';
      }
      if (content) {
        content = contentTitle + content;
        content += "您确定生成订单吗？"
      }

      if (content) {
        Modal.confirm({
          title: '此订单需要上级审核',
          content: content,
          onOk: () => {
            values.needAudit = true;
            callback(values);
          },
          onCancel: () => {
            console.log('Cancel');
            that.setState({ loading: false });
          },
        });
      } else {
        callback(values)
      }
    } else {
      callback(values)
    }
  }
  onSave = () => { 
    var that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.changeEeqError();
        that.setState({ loading: true });
        values.orderStatus = 0;
        this.checkAndFillData(values, function (values) {

          if (values) {
            var params = {
              studentId: that.state.dataModel.studentId,
              productIds: that.state.productIds.join(',')
            }
            if (Array.isArray(values.areaId)) {
              values.areaId = values.areaId[values.areaId.length - 1];
            }
            that.props.checkCourseIsStudy(params).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                if(data.data.isPrompt){
                  Modal.confirm({
                      title: data.data.promptMsg,
                      content: '点击确认提交订单!否则点击取消！',
                      onOk: () => {
                          that.props.viewCallback({ ...values });
                      },
                      onCancel: () => {
                          that.setState({ loading: false ,liveOnff:false});
                      },
                  });
                }else{
                  that.props.viewCallback({ ...values });
                }
              }
              else {
                message.error(data.message);
              }
            })
          }
          // setTimeout(() => {
          //   that.setState({ loading: false });
          // }, 3000);//合并保存数据
        });
      }
    });
  }
  onSubmit = (values) => { 
    var that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.changeEeqError(); 
        that.setState({ loading: true  });
        //用于 判断是否跳转缴费单页
        this.checkAndFillData(values, function (values) {
          if (values) {
            var params = {
              studentId: that.state.dataModel.studentId,
              productIds: that.state.productIds.join(',')
            }
            if (Array.isArray(values.areaId)) {
              values.areaId = values.areaId[values.areaId.length - 1];
            }
            that.props.checkCourseIsStudy(params).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'success') {
                if(data.data.isPrompt){
                  Modal.confirm({
                      title: data.data.promptMsg,
                      content: '点击确认提交订单!否则点击取消！',
                      onOk: () => {
                          that.props.viewCallback({ ...values });
                      },
                      onCancel: () => {
                          that.setState({ loading: false ,liveOnff:false});
                      },
                  });
                }else{
                  that.props.viewCallback({ ...values });
                }
              }
              else {
                message.error(data.message);
              }
            })

            
          }
          // setTimeout(() => {
          //   that.setState({ loading: false });
          // }, 3000);//合并保存数据
        });
      }
    });
  }

  componentWillMount() {
    //this.loadBizDictionary(['discount_type', 'partner_class_type']);
    this.loadBizDictionary(['discount_type', 'payee_type']);
    this.getTeachCenters();
    this.getStudentById();
    this.getPayeeTypeByBranchId();
    this.getOrderById();  
  } 
  componentWillReceiveProps(props){  
    if(props.reqErroe){ 
      this.setState({
          loading:false,
          liveOnff:false, 
      })
    }
  } 
  //切换自定义分期tab
  onChangeTab = (activeKey) => {
    this.setState({isCustomizeInstalment:activeKey});
    this.isNeedResetTerm = true;
    this.calculateFee();
  }

  renderEditModeOfView() {
  }

  render() {  
    if (this.props.editMode == 'OrderClassDirection'
      || this.props.editMode == 'OrderClassAmateur'
      || this.props.editMode == 'OrderPerson' || this.state.editMode == "OrderPersonOnline") {

    } else {
      return (<div></div>)
    }
    if(this.props.editMode == 'ProductView'){
      return 
    }

    const { getFieldDecorator } = this.props.form;
    var title = "创建" + (this.props.editMode == "OrderClassDirection" ? "方向班"
      : this.props.editMode == "OrderClassAmateur" ? "业余班"
        : this.props.editMode == "OrderPerson" || (this.state.editMode == "OrderPersonOnline") ? "个人" : "未知") + "订单   第二步：创建订单，报班及优惠设置";

    var content =
      <Form>
        <ContentBox titleName={title} hideBottomBorder={true}>
          <div className="dv_split"></div>
          <Row gutter={24} style={{ width: "90%" }}>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="姓名">
                {/*<a href="http://www.baidu.com" target="_blank">{this.state.dataModel.realName}</a>*/}
                {this.state.dataModel.realName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="证件号码">
                {this.state.dataModel.certificateNo}
              </FormItem>
            </Col>
          </Row>
          <div className="dv_split"></div>
        </ContentBox>
        <ContentBox titleName='订单基本信息部分' hideBottomBorder={true}>
          <div className="dv_split"></div>
          <Row gutter={24} style={{ width: "90%" }}>
            {
              (this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") ? '' : <Col span={12}>
                <FormItem {...searchFormItemLayout} label="大客户">
                  {getFieldDecorator('partnerId', {
                    initialValue: this.state.dataModel.partnerId,
                    rules: [{ required: true, message: '请选择一个大客户!' }],
                  })(
                    <SelectPartnerOrg scope={'branch'} hideAll={true}
                      //ref="refPartner"
                      callback={(data) => {
                        this.setState({
                          partnerInfo: data
                        })
                      }}
                      partnerClassType={this.state.editMode == "OrderClassDirection" ? 1 : this.state.editMode == "OrderClassAmateur" ? 2 : -1}
                      disabledPartner={this.state.disabledPartner}
                      ref={(ref: SelectPartnerOrg) => {
                        this.refPartner = ref
                      }}
                    />
                    )}
                </FormItem>
              </Col>
            }
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="教学点">
                {getFieldDecorator('teachCenterId', {
                  initialValue: this.state.dataModel.teachCenterId,
                  rules: [{ required: true, message: '请选择教学点!' }],
                })(
                  <Select>
                    {this.state.bz_teach_center_list.map((item, index) => {
                      return <Option value={item.value} title={item.title} key={index}>{item.title}{item.state == 0 ? '【停用】' : ''}</Option>
                    })}
                  </Select>
                  )}
              </FormItem>
            </Col>
            {
              (this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") &&
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label="收费方">
                  {getFieldDecorator('payeeType', {
                    initialValue: this.state.dataModel.payeeType,
                    rules: [{ required: true, message: '请选择一个收费方!' }],
                  })(
                    <Select onChange={(value) => {
                      this.setState({
                        payeeType: value
                      })
                    }}>
                      {this.state.bz_payee_type_list.map((item, index) => {
                        return <Option value={item.value} key={index}>{item.title}</Option>
                      })}
                    </Select>
                    )}
                </FormItem>
              </Col>
            }
            <Col span={24}></Col>
            <Col span={12}>
                <FormItem {...searchFormItemLayout} label="学生常驻城市">
                  {getFieldDecorator('areaId', {
                    initialValue: dataBind(this.state.dataModel.areaId),
                    rules: [{ required: true, message: '请选择学生常驻城市!' }],
                    })(
                      <AreasSelect
                        value={this.state.dataModel.areaId}
                        areaName={this.state.dataModel.areaName}
                        isFilter={true}
                      />
                  )}
                </FormItem>
              </Col>
              <Col span={12}></Col>
          </Row>
          <Row gutter={24} style={{ width: "90%" }}>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="老生姓名">
                {getFieldDecorator('recommendStudentName', {
                  initialValue: this.state.dataModel.recommendStudentName,
                })(
                  <Input />
                  )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="老生手机">
                {getFieldDecorator('recommendStudentPhone', {
                  initialValue: this.state.dataModel.recommendStudentPhone,
                })(
                  <Input />
                  )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="代理姓名">
                {getFieldDecorator('agentName', {
                  initialValue: this.state.dataModel.agentName,
                })(
                  <Input />
                  )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="代理手机">
                {getFieldDecorator('agentPhone', {
                  initialValue: this.state.dataModel.agentPhone,
                })(
                  <Input />
                  )}
              </FormItem>
            </Col>
          </Row>
          <div className="dv_split"></div>
        </ContentBox>
        <ContentBox titleName='选择商品' hideBottomBorder={true}>
          <div className="dv_split"></div>
          <Row gutter={24} justify="center" type="flex" style={{width:'100%'}}>
              <Button style={{marginBottom:20}} onClick={this.onChooseProduct} icon="save">选择商品</Button>
          </Row>
          <div className='block_content'>
            <Table columns={this.state.editMode == 'OrderClassDirection' ? this.columns_product : this.columns_product_amateur} //列定义
              loading={this.state.loading}
              pagination={false}
              dataSource={this.state.product_list}//数据
              bordered
              scroll={{ x: 1300 }}
            />
          </div>
          <div className="dv_split"></div>
        </ContentBox>
        {
          this.props.editMode != "OrderClassDirection" &&
            this.state.product_list.length ?
            <ContentBox titleName='订单优惠设置部分' hideBottomBorder={true}>
              <div className="dv_split"></div>
              <Row gutter={24}>
                {/* <span>请选择优惠：</span>
                <SelectDiscount
                  placeholder={"请输入优惠折扣"}
                  style={{ width: 200 }}
                  isAutoSearch={false}
                  productIds={this.state.productIds.join(',')}
                  setChooseValueChange={(value, obj) => {
                    if (value && obj) {
                      this.choosed_discount_single = obj
                    }
                  }}
                />
                <Button icon="save" onClick={() => this.onAddDiscountSingle()}>确定添加</Button> */}
                <Button style={{marginBottom:20}} onClick={() => {this.onChooseDiscount(0)}} icon="save">选择优惠</Button>
                <span className="split_button"></span>
                <Button style={{marginBottom:20}} onClick={() => {this.onChooseDiscount(1)}} icon="save">满减优惠</Button>
              </Row>
                <div className="dv_split" style={{height:13}}></div>
              <div className='block_content'>
                <Table columns={this.columns_discount} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.state.bz_discount_single_list}//数据
                  bordered
                />
              </div>
              <div className="dv_split"></div>
            </ContentBox>
            : ""
        }
        {
          this.state.fee_list.length ?
            <ContentBox titleName='订单费用汇总及分期设置' hideBottomBorder={true}>
              <div className="dv_split"></div>
              <div className='block_content'>
                <Table columns={this.columns_fee} //列定义
                  loading={this.state.loading}
                  pagination={false}
                  dataSource={this.state.fee_list}//数据
                  bordered

                />
              </div>
              <div className="dv_split"></div>
            </ContentBox>
            : ""
        }
        {
          //this.state.product_list.length ?
          <ContentBox titleName='缴费分期' bottomButton={
            <FormItem className='btnControl' {...btnformItemLayout}>
              <Button onClick={this.onSave} loading={this.state.loading} icon="save">暂存</Button>
              <span className="split_button"></span>
              <Button onClick={this.onSubmit} loading={this.state.loading} icon="save" type="primary">提交订单</Button>
              <span className="split_button"></span>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>}
          >
            <div style={{height:'30px'}}></div>
            {
              (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") ?
              <Tabs defaultActiveKey={this.state.isCustomizeInstalment} type="card" onChange={this.onChangeTab}>
                    <TabPane tab={'标准分期'} key={`0`}>
                        
                    </TabPane>
                    <TabPane tab={'自定义分期'} key={`1`}>
                        
                    </TabPane>
                </Tabs>
                : ''
            }
            <div style={{height:'10px'}}></div>
            {
              (this.state.editMode == "OrderClassAmateur" || this.state.editMode == "OrderPerson" || this.state.editMode == "OrderPersonOnline") ?
                <Row gutter={24} className='formTitle'>
                  <span>缴费分期：</span>
                  <Select
                    onChange={(value, e) => this.onSelectTermChange(value, e)}
                    style={{ width: 120 }}
                    value={dataBind(this.state.term_num)}
                  >
                    <Option value="1">1</Option>
                    <Option value="2">2</Option>
                    <Option value="3">3</Option>
                    { this.state.editMode == "OrderClassAmateur" && <Option value="4">4</Option> }
                  </Select>
                  <Button onClick={this.onButtonChooseTerm} icon="save">确定</Button>
                </Row>
                : ""
            }
              <div className="dv_split" style={{height:13}}></div>
            {
              this.state.term_list.length ?
                <div className='block_content'>
                  <Table columns={this.state.isCustomizeInstalment == '0' ? this.columns_term : this.columns_term_custom} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.term_list}//数据
                    bordered
                    //scroll={{ x: 900 }}
                  />
                </div>
                : <div></div>
            }
              <div className="dv_split" style={{height:13}}></div>
            <Row gutter={24} style={{ width: "90%" }}>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24}
                    label='上传备注附件'
                    extra={this.state.dataModel.remarkFilePath && <a href={this.state.dataModel.remarkFilePath} target='_Blank'>点我查看已上传的附件</a>}>
                  {getFieldDecorator('remarkFilePath', {
                    initialValue: dataBind(this.state.dataModel.remarkFilePath),
                  })(
                    <UploadRemarkFile />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24} style={{ width: "90%" }}>
              <Col span={24}>
                <FormItem {...searchFormItemLayout24} label="订单备注">
                  {getFieldDecorator('applyReason', {
                    initialValue: this.state.dataModel.applyReason,
                  })(
                    <TextArea rows={4} />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <span style={{ color: "red" }}>
                  当期应缴金额（¥） ：{formatMoney(this.state.term_list.length ? this.state.term_list[0].payableAmount : this.state.dataModel.payableAmount)}          收费方：{this.state.payeeType ? getDictionaryTitle(this.state.payee_type, this.state.payeeType) : this.state.dataModel.payeeTypeStr}
                </span>
              </Col>
            </Row>
            <div className="dv_split"></div>
          </ContentBox>
          //: ""
        }
        {
          this.state.isShowChooseProduct &&
          <Modal
            title="订单商品选择"
            visible={this.state.isShowChooseProduct}
            //onOk={this.onChangeDate}
            onCancel={this.onHideModal}
            //okText="确认"
            //cancelText="取消"
            footer={null}
            width={1000}
          >
            <ChooseProduct
              partnerId={this.state.partnerId}
              choosedProductIds={this.state.productIds.join(',')}
              choosedProductList={this.state.product_list}
              onCallback={this.onChoosedProduct}
              partnerClassTypeId={this.state.editMode == "OrderClassDirection" ? 1 : this.state.editMode == "OrderClassAmateur" ? 2 : ""}
              partnerInfo={this.state.partnerInfo}
              payeeType={this.state.payeeType || this.state.dataModel.payeeType}
            />
          </Modal>
        }
        {
          this.state.isShowChooseDiscount &&
          <Modal
            title={this.state.fullPriceCondition ? "满减优惠选择" : "商品优惠选择"}
            visible={this.state.isShowChooseDiscount}
            //onOk={this.onChangeDate}
            onCancel={this.onHideModal}
            //okText="确认"
            //cancelText="取消"
            footer={null}
            width={1000}
          >
            <ChooseDiscount
              partnerId={this.state.partnerId}
              choosedProductIds={this.state.productIds.join(',')}
              choosedDiscountIds={this.state.discountIds.join(',')}
              choosedProductList={this.state.product_list}
              onCallback={this.onChoosedDiscount}
              partnerClassTypeId={this.state.editMode == "OrderClassDirection" ? 1 : this.state.editMode == "OrderClassAmateur" ? 2 : ""}
              partnerInfo={this.state.partnerInfo}
              payeeType={this.state.payeeType || this.state.dataModel.payeeType}
              fullPriceCondition={this.state.fullPriceCondition}
              discountType={this.state.discountType}
            />
          </Modal>
        }
        {
          this.state.isShowProductDetail &&
          <Modal
            title="商品详细信息"
            visible={this.state.isShowProductDetail}
            //onOk={this.onChangeDate}
            onCancel={this.onHideModal}
            //okText="确认"
            //cancelText="取消"
            footer={null}
            width={1000}
          >
            <ProductView
                viewCallback={this.onHideModal}
                editMode={'View'}
                currentDataModel={this.state.productDetail} />
          </Modal>
        }
      </Form>

    return content;

  }
}

const WrappedView = Form.create()(OrderEdit);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  let branchId = state.auth.currentUser.userType.orgId;
  return {
    Dictionarys,
    //menus: state.menu.items
    branchId
  }
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //queryDiscountByFold: bindActionCreators(queryDiscountByFold, dispatch),
    //queryDiscountBySingle: bindActionCreators(queryDiscountBySingle, dispatch),

    studentById: bindActionCreators(studentById, dispatch),
    getOrderById: bindActionCreators(getOrderById, dispatch),
    //getItemList: bindActionCreators(getItemList, dispatch),
    orgTeachCenterOnByBranchId: bindActionCreators(orgTeachCenterOnByBranchId, dispatch),
    queryMaxDiscountQuotaByItems: bindActionCreators(queryMaxDiscountQuotaByItems, dispatch),
    queryPayeeTypeByBranchId: bindActionCreators(queryPayeeTypeByBranchId, dispatch),
    getTeachCenterByUserList: bindActionCreators(getTeachCenterByUserList, dispatch),
    checkCourseIsStudy: bindActionCreators(checkCourseIsStudy, dispatch),
    getCourseCategoryPrice: bindActionCreators(getCourseCategoryPrice, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
