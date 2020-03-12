/*
订单金额及分期特殊调整 - 调整
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
  Checkbox, message, Table, Select, Radio, InputNumber
} from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group
import NumericInput from '@/components/NumericInput';
import EditForm from '@/components/EditForm';

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
import { getOrderById } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';
import { queryMaxDiscountQuotaByItems, getCourseCategoryPrice } from '@/actions/recruit';

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
      isCustomizeInstalment: props.isCustomizeInstalment || '0'   //是否为自定义分期
    };
    this.product_index_last = 0;
    this.discount_index_last = 0;
    this.choosed_discount_single = null;
    this.isNeedResetTerm = false;
    (this: any).onSubmit = this.onSubmit.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    (this: any).getOrderById = this.getOrderById.bind(this);
    (this: any).getMaxDiscountQuota = this.getMaxDiscountQuota.bind(this);

    (this: any).checkAndFillData = this.checkAndFillData.bind(this);
    (this: any).calculateFee = this.calculateFee.bind(this);
    (this: any).onSelectTermChange = this.onSelectTermChange.bind(this);
    (this: any).onButtonChooseTerm = this.onButtonChooseTerm.bind(this);
    (this: any).onMoneyNumberChange = this.onMoneyNumberChange.bind(this);
    (this: any).onLastMoneyNumberChange = this.onLastMoneyNumberChange.bind(this);
    (this: any).onDateChange = this.onDateChange.bind(this);
    (this: any).disabledPayableDate = this.disabledPayableDate.bind(this);
    (this: any).setTermMoneyByCategory = this.setTermMoneyByCategory.bind(this);
    (this: any).onCourseCategoryChange = this.onCourseCategoryChange.bind(this);
  }

  componentWillMount() {
    this.loadBizDictionary(['payee_type']);
    this.getOrderById();
  }

  getOrderById() {
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
                    money: cp.productAmount
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
          var discount_list = [{}, {}];
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
                discount_list.splice(0, 0, temp_d);
              }
            })
          }
          this.discount_index_last = discount_list.length - 2;
          that.setState({
            dataModel: data.data,
            product_list: p_list,
            term_list: t_list,
            productIds: p_id_list,
            bz_discount_single_list: discount_list,
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

  //----------费用-----------//

  calculateFee() {
    var that = this;
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

      setTimeout(function () {
        that.getMaxDiscountQuota();
        that.onButtonChooseTerm();
      }, 200);
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
  ];

  //----------分期付款-----------//

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
          return <InputNumber
            onChange={(value) => this.onLastMoneyNumberChange(value, record.term)}
            value={text}
            placeholder={''}
            maxLength="25"
            precision={2}
            style={{ width: '120px' }}
          />
        }
        return <NumericInput value={text} onChange={(value) => this.onMoneyNumberChange(value, record.term)} />
        
      }
    },
  ];

  onLastMoneyNumberChange(value, term) {

    this.state.term_list[term-1].payableAmount = value;

    this.setState({
      term_list: this.state.term_list
    });

  }
  onMoneyNumberChange(value, term) {
    var curr = null;
    //最终实缴金额
    for (var i = 0; i < this.state.term_list.length - 1; i++) {
      var item = this.state.term_list[i];
      if (item.term == term) {
        item.payableAmount = parseFloat(value || 0);
        curr = item;
      }
    }
    
    curr.payableAmount = value;

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
    values.orderId = this.state.dataModel.orderId;

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



    var orderInstalmentJson = [];
    //{"term":1, "payableAmount":"50000", "payableDate":"2018-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92ad,a81acff846c111e89aa5f8bc129b92bb"},{"term":2, "payableAmount":"19100", "payableDate":"2019-04-26", "courseCategoryIds":"a81acff846c111e89aa5f8bc129b92cc"}
    this.state.term_list.map(i => {
      orderInstalmentJson.push({
        term: i.term, payableAmount: i.payableAmount, payableDate: i.payableDate,
        courseCategoryIds: i.courseCategoryIds.join(',')
      })
    });

    values.orderInstalmentJson = JSON.stringify(orderInstalmentJson);

    var isAllCategoryChoosed = this.checkAllCategoryChoosed();
    if(!isAllCategoryChoosed){
      message.error("有未选的科目！");
      that.setState({ loading: false });
      return null;
    }
    
    callback(values)

  }

  onSubmit = (values) => {
    var that = this;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        that.setState({ loading: true });
        //用于 判断是否跳转缴费单页
        this.checkAndFillData(values, function (values) {
          if (values) {
            var params = {
              studentId: that.state.dataModel.studentId,
              productIds: that.state.productIds.join(',')
            }

            Modal.confirm({
                title: "提交订单",
                content: '点击确认提交订单!否则点击取消！',
                onOk: () => {
                    that.props.viewCallback({ ...values });
                },
                onCancel: () => {
                    console.log('Cancel');
                },
            });
                
          }
          setTimeout(() => {
            that.setState({ loading: false });
          }, 3000);//合并保存数据
        });
      }
    });
  }

  renderEditModeOfView() {
  }

  render() {
    
    const { getFieldDecorator } = this.props.form;

    var content =
      <Form>
        
        <ContentBox titleName='订单基本信息部分' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单类型"
                            >
                            {this.state.dataModel.orderType == 1 ? '个人订单' : this.state.dataModel.partnerClassType == 1 ? '大客户方向班' : '大客户精英班'}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单状态"
                            >
                            {this.state.dataModel.orderStatusStr}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="主体"
                            >
                            {this.state.dataModel.zbPayeeTypeStr}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单归属"
                            >
                                {this.state.dataModel.regionName} {this.state.dataModel.branchName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="市场人员"
                            >
                              {this.state.dataModel.benefitMarketUserName}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='电咨人员'
                            >
                              {this.state.dataModel.benefitPconsultUserName}
                            </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="面咨人员"
                            >
                              {this.state.dataModel.benefitFconsultUserName}
                            </FormItem>
                        </Col>

                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="创建人"
                            >
                              {this.state.dataModel.createName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="创建日期"
                            >
                              {this.state.dataModel.createDateStr}
                           </FormItem>
                        </Col>
                        {  //非个人订单显示大客户
                            this.state.dataModel.orderType != 1 && <Col span={12}>
                                                    <FormItem
                                                        {...searchFormItemLayout}
                                                        label="大客户"
                                                    >
                                                        {this.state.dataModel.orgName}
                                                    </FormItem>
                                                </Col>
                        }
                        
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="教学点"
                            >
                              {this.state.dataModel.teachCenterName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="老学生姓名"
                            >
                              {this.state.dataModel.recommendStudentName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="老学生手机"
                            >
                              {this.state.dataModel.recommendStudentPhone}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="代理姓名"
                            >
                              {this.state.dataModel.agentName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="代理手机"
                            >
                              {this.state.dataModel.agentPhone}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="备注"
                            >
                              {this.state.dataModel.applyReason}
                           </FormItem>
                        </Col>
                        {
                            this.state.dataModel.remarkFilePath && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="备注附件"
                                >
                                <a href={this.state.dataModel.remarkFilePath} target='_Blank'>点我查看</a>
                               </FormItem>
                            </Col>
                        }
                    </Row>

                    <div className='block_content'>
                      <Table columns={this.columns_fee} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.fee_list}//数据
                        bordered
                      />
                    </div>
                </Form>

            </ContentBox>
        
        {
          //this.state.product_list.length ?
          <ContentBox titleName='缴费分期' bottomButton={
            <FormItem className='btnControl' {...btnformItemLayout}>
              <Button onClick={this.onSubmit} loading={this.state.loading} icon="save" type="primary">提交</Button>
              <span className="split_button"></span>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>}
          >
            <div style={{height:'30px'}}></div>
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
                    <Option value="4">4</Option> 
                  </Select>
                  <Button onClick={this.onButtonChooseTerm} icon="save">确定</Button>
                </Row>
              <div className="dv_split" style={{height:13}}></div>
            {
              this.state.term_list.length ?
                <div className='block_content'>
                  <Table columns={this.columns_term_custom} //列定义
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
                <FormItem {...searchFormItemLayout24} label="订单备注">
                  {getFieldDecorator('applyReason', {
                    initialValue: this.state.dataModel.applyReason,
                  })(
                    <TextArea rows={4} disabled/>
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
    getOrderById: bindActionCreators(getOrderById, dispatch),
    queryMaxDiscountQuotaByItems: bindActionCreators(queryMaxDiscountQuotaByItems, dispatch),
    getCourseCategoryPrice: bindActionCreators(getCourseCategoryPrice, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
