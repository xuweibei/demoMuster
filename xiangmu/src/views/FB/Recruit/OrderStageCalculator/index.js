/**
 * 订单分期计算器
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
    Checkbox, message, Table, Select, Radio
} from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group
import NumericInput from '@/components/NumericInput';
import EditForm from '@/components/EditForm';
import ChooseProduct from './choose_product';
import ChooseDiscount from './choose_discount';

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

import { studentById } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';
import { orgTeachCenterOnByBranchId, getTeachCenterByUserList } from '@/actions/base';
import { queryMaxDiscountQuotaByItems, queryPayeeTypeByBranchId } from '@/actions/recruit';

import ProductView from '@/components/ProductDetail/view'

//let STAFF_LIMIT = 200;

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class OrderStageCalculator extends React.Component {
    product_index_last: number;
    discount_index_last: number;
    choosed_discount_single: any;
    constructor(props) {
        super(props);
        var _discount = [];
        _discount.push({});
        _discount.push({});
        this.state = {
            editMode: [],
            dataModel: {},//数据模型
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
            payeeType: '',

            term_num: 1,    //默认一期，即整单
            courseCategoryList: [],

            category_money_list: [],  //暂存 按科目计算的订单应付金额。在分期处根据需要来合并
        };
        this.product_index_last = 0;
        this.discount_index_last = 0;
        this.choosed_discount_single = null;
        this.isNeedResetTerm = false;
        this.loadBizDictionary = loadBizDictionary.bind(this);
        (this: any).getMaxDiscountQuota = this.getMaxDiscountQuota.bind(this);
        (this: any).getPayeeTypeByBranchId = this.getPayeeTypeByBranchId.bind(this);
        (this: any).onChoosedProduct = this.onChoosedProduct.bind(this);  //选商品后回调
        (this: any).onChooseProduct = this.onChooseProduct.bind(this);    //选商品按钮
        (this: any).onHideModal = this.onHideModal.bind(this);
        (this: any).onRemove = this.onRemove.bind(this);
        (this: any).calculateFee = this.calculateFee.bind(this);
        (this: any).onSelectTermChange = this.onSelectTermChange.bind(this);
        (this: any).onButtonChooseTerm = this.onButtonChooseTerm.bind(this);
        (this: any).onDateChange = this.onDateChange.bind(this);
        (this: any).disabledPayableDate = this.disabledPayableDate.bind(this);
        (this: any).setTermMoneyByCategory = this.setTermMoneyByCategory.bind(this);
        (this: any).onCourseCategoryChange = this.onCourseCategoryChange.bind(this);
    }

    componentWillMount() {
        //this.loadBizDictionary(['discount_type', 'partner_class_type']);
        this.loadBizDictionary(['discount_type', 'payee_type']);
        this.getPayeeTypeByBranchId();
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
    setTermMoneyByCategory() {
        if (this.state.editMode == "OrderClassDirection") {
            return;
        }

        //商品所属科目
        //商品上的折扣
        //整单优惠
        //员工特殊优惠
        var _category_list = [];  //最终 科目-金额 列表
        var _product_category_list = [];  //暂时 商品-科目-金额 列表
        var _moneyDiscount = 0;
        if (this.state.fee_list.length) {
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
                _product_category_list.map(m => {
                    if (m.product == p.productId) {
                        m.money = parseFloat((m.money * p.discount.productDiscountPrice / 100).toFixed(2));
                    }
                })

            }
        });
        if (!_product_category_list.length) {
            return;
        }

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
                for (var i = 0; i < _category_list.length; i++) {
                    var c = _category_list[i];
                    if (i == _category_list.length - 1) {
                        var lastMoney = totalMoney;
                        for (var i = 0; i < _category_list.length - 1; i++) {
                            lastMoney = lastMoney - _category_list[i].money;
                        }
                        c.money = parseFloat(lastMoney.toFixed(2));
                    } else {
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
        this.setState({ isShowChooseProduct: true })
    }

    setTermList(p_list) {
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
        this.setState({
            term_list: t_list,
            product_list: p_list,
            productIds: ids,
            payeeType: payeeType,   //收费方

            isShowChooseProduct: false,
            disabledPartner: true,
            bz_discount_single_list: temp_list
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
            totalInitialAmount: _total,
            totalProductDiscountAmount: _discount_percent,
            totalOrderDiscountAmount: _discount_money,
            totalProductAmount: _order,
        })
        this.setState({
            fee_list: fee_list,
        });
                setTimeout(function () {
                that.onButtonChooseTerm();
                that.getMaxDiscountQuota();
            }, 200);
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

    columns_product_amateur = [
        {
            title: '商品名称',
            width: 180,//可预知的数据长度，请设定固定宽度
            //fixed: 'left',
            dataIndex: 'productName',
            render: (value, record, index) => {
                if (index < this.product_index_last) {
                    return <div><a onClick={() => {
                        this.setState({ productDetail: record });
                        setTimeout(() => {
                            this.setState({ isShowProductDetail: true });
                        }, 300)
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
            title: '实际金额（¥）',
            render: (value, record, index) => {
                if (index < this.product_index_last) {
                    var _money = parseFloat(record.productTotalPrice || 0) * parseFloat(record.discount.productDiscountPrice || 100) / 100;
                    return <span>{formatMoney(_money)}</span>
                }
                var amount = 0;
                this.state.product_list.map(item => {
                    var _money2 = parseFloat(item.productTotalPrice || 0) * parseFloat(item.discount.productDiscountPrice || 100) / 100;
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
                            record.courseCategoryList.sort((a, b) => {
                                return
                                if (a.title < b.title) {
                                    return -1;
                                } else if (a.title > b.title) {
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
                            if (a.title < b.title) {
                                return -1;
                            } else if (a.title > b.title) {
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
            title: '分期缴费金额',
            width: 120,
            dataIndex: 'payableAmount',
            render: (text, record, index) => {
                return <span>{formatMoney(text)}</span>
            }
        },
    ];
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
                if (!this.isNeedResetTerm) {
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
                        if (_courseCategoryList[i].value == c.courseCategoryId) {
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
                payableDate: timestampToTime(d.valueOf()),
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
    checkAllCategoryChoosed() {
        if (this.state.term_list.length > 0) {
            //2018-08-08 判断 如果 所有科目都选上了，那么就把最后一期的金额 = 总额 - 前几期之和
            var isAllCategoryChoosed = true;  //是否所有科目都选上了
            var all_category_list = this.state.term_list[0].courseCategoryList;
            for (var a = 0; a < all_category_list.length; a++) {
                var c = all_category_list[a];
                var isExist = false;
                for (var i = 0; i < this.state.term_list.length; i++) {
                    var cIds = this.state.term_list[i].courseCategoryIds;
                    cIds.map(id => {
                        if (c.value == id) {
                            isExist = true;
                        }
                    })
                    if (isExist) {
                        break;
                    }
                }
                if (!isExist) {
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

        var isAllCategoryChoosed = this.checkAllCategoryChoosed();
        if (isAllCategoryChoosed) {
            //所有科目都选上了
            var lastTerm = this.state.term_list[this.state.term_list.length - 1];
            var totalMoney = this.state.fee_list[0].totalProductAmount;
            var lastMoney = totalMoney;
            for (var i = 0; i < this.state.term_list.length - 1; i++) {
                lastMoney = lastMoney - this.state.term_list[i].payableAmount
            }
            lastTerm.payableAmount = parseFloat(lastMoney.toFixed(2));
        }

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
    render() {
        if (this.props.editMode == 'ProductView') {
            return
        }
        const { getFieldDecorator } = this.props.form;

        var content =
            <Form>
                <ContentBox titleName='选择商品' hideBottomBorder={true}>
                    <div className="dv_split"></div>
                    <Row gutter={24} justify="center" type="flex" style={{ width: '100%' }}>
                        <Button style={{ marginBottom: 20 }} onClick={this.onChooseProduct} icon="save">选择商品</Button>
                    </Row>
                    <div className='block_content'>
                        <Table columns={this.columns_product_amateur} //列定义
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
                    <ContentBox titleName='缴费分期'>
                        <div className="dv_split"></div>
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
                            </Select>
                            <Button onClick={this.onButtonChooseTerm} icon="save">确定</Button>
                        </Row>
                        <div className="dv_split" style={{ height: 13 }}></div>
                        {
                            this.state.term_list.length ?
                                <div className='block_content'>
                                    <Table columns={this.columns_term} //列定义
                                        loading={this.state.loading}
                                        pagination={false}
                                        dataSource={this.state.term_list}//数据
                                        bordered
                                    //scroll={{ x: 900 }}
                                    />
                                </div>
                                : <div></div>
                        }

                        <div className="dv_split"></div>
                    </ContentBox>
                }
                {
                    this.state.isShowChooseProduct &&
                    <Modal
                        title="订单商品选择"
                        visible={this.state.isShowChooseProduct}
                        onCancel={this.onHideModal}
                        footer={null}
                        width={1000}
                    >
                        <ChooseProduct
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
                    this.state.isShowProductDetail &&
                    <Modal
                        title="商品详细信息"
                        visible={this.state.isShowProductDetail}
                        onCancel={this.onHideModal}
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

const WrappedView = Form.create()(OrderStageCalculator);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    let branchId = state.auth.currentUser.userType.orgId;
    return {
        Dictionarys,
        branchId
    }
};

function mapDispatchToProps(dispatch) {
    return {
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

        studentById: bindActionCreators(studentById, dispatch),
        orgTeachCenterOnByBranchId: bindActionCreators(orgTeachCenterOnByBranchId, dispatch),
        queryMaxDiscountQuotaByItems: bindActionCreators(queryMaxDiscountQuotaByItems, dispatch),
        queryPayeeTypeByBranchId: bindActionCreators(queryPayeeTypeByBranchId, dispatch),
        getTeachCenterByUserList: bindActionCreators(getTeachCenterByUserList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
