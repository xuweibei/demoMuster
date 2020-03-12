/*
招生季编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Select, Checkbox, Spin, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, convertTextToHtml, split } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

import {
    partnerProductPriceApplyGetById,
    getPartnerContractList,
    partnerProductPriceApplyCaculatorProductTermPrice,
    partnerProductPriceApplySearchZPriceForPartner
} from '@/actions/partner';

import {
    recruitProductPriceList, recruitBindProductPriceInfoUpById, recruitCourseProductPriceInfoById
} from '@/actions/recruit';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg';
import EditablePowerPartnerTagGroup from '@/components/EditablePowerPartnerTagGroup';
import EditableProductForPartner from '@/components/EditableProductForPartner';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]{productId,productType,recruitBatchId,productPriceId}
viewCallback [回调]
*/
class ProductPriceApplyView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                currentPage: 1,
                pageSize: 999,
                productName: '',
                recruitBatchId: '',
                itemId: '',
                classTypeId: '',
                productType: '',
            },
            data: [],//商品列表
            product_price_list: [],//商品价格明细列表
            all_CourseCategorys: [],//所有科目
            PartnerContractList: [],//合同列表
            dic_fenqi: [1, 2, 3, 4].map((item, index) => {
                return { id: item, money: 0, courseCategoryIds: [] }
            }),
            currentFenQi: 4,//分期数
            _currentFenQi: 4,//分期数
            tableLoading: false,
            dic_partnerClassTypes: [],//字典
        };

        console.log(this.state.dataModel)
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode', 'teachmode', 'partner_class_type']);
        if (this.props.editMode == 'View' || this.props.editMode == 'Audit' || this.props.editMode == 'Delete') {
            //加载最新信息
            let _this = this;
            _this.props.partnerProductPriceApplyGetById({ productPriceApplyId: _this.state.dataModel.productPriceApplyId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    _this.setState({
                        dataModel: { ...this.state.dataModel, ...data.data }
                    })
                    _this.setState({ tableLoading: false })
                }
            });
        }
        else if (this.props.editMode != 'Create' && this.props.editMode != 'Copy' && this.props.editMode != 'BatchAudit') {
            //加载商品标准定价列表
            let _this = this;
            this.fetchProductPriceDetail(this.state.dataModel, () => {
                //加载最新信息
                _this.props.partnerProductPriceApplyGetById({ productPriceApplyId: _this.state.dataModel.productPriceApplyId }).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        message.error(data.message);
                    }
                    else {
                        _this.setState({
                            dataModel: { ...this.state.dataModel, ...data.data }
                        })
                        //更新定价设置
                        data.data.productCoursePriceApplyLst.map((item) => {
                            let find = _this.state.product_price_list.find(a => a.courseId == item.courseId);
                            if (find) {
                                find.coursePrice = item.coursePrice;
                                find.classHour = item.classHour;
                            }
                        });
                        _this.setState({ product_price_list: _this.state.product_price_list });

                        //设置分期数
                        _this.setState({ _currentFenQi: data.data.productTermPriceApplyLst.length, currentFenQi: data.data.productTermPriceApplyLst.length })
                        //更新分期设置
                        data.data.productTermPriceApplyLst.map((item) => {
                            let find = _this.state.dic_fenqi.find(a => a.id == item.term);
                            if (find) {
                                find.money = item.productTermPrice;
                                find.courseCategoryIds = split(item.courseCategoryIds);
                            }
                        });
                        _this.setState({ dic_fenqi: _this.state.dic_fenqi });

                        _this.setState({ tableLoading: false })
                    }
                });
            });
        }
    }

    //检索数据
    fetchZbProductList(condition) {
        condition.publishState = 1;//已经发布
        condition.productType = 1;//仅捆绑商品
        this.props.partnerProductPriceApplySearchZPriceForPartner(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    pagingSearch: condition,
                    ...data,
                })
            }
            else {
                message.error(data.message);
            }
        })
    }

    //获取条件列表
    fetchPartnerContract(partnerId) {
        let condition = {
            partnerId,
            pageSize: 10,
            currentPage: 1,
        };
        this.props.getPartnerContractList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                this.setState({
                    PartnerContractList: data.data,
                })
            }
            else {
                message.error(data.message);
            }
        })
    };
    //查看分期金额
    fetchProductTermPrice() {
        //校验分期是否设置ok
        let messages = [];
        var chooseAllCourseCategoryIds = [];
        this.state.dic_fenqi.filter(a => a.id <= this.state.currentFenQi).map((item) => {
            if (item.courseCategoryIds.length == 0) {
                messages.push(`第${item.id}期,未设置开通科目`)
            }
            chooseAllCourseCategoryIds = [...chooseAllCourseCategoryIds, ...item.courseCategoryIds];
        });
        //如果选择的项目id总和不等于所有项目数，则提示
        if (chooseAllCourseCategoryIds.length != this.state.all_CourseCategorys.length) {
            messages.push(`所有的开通科目设置有遗漏未勾选`)
        }
        if (messages.length > 0) {
            message.warning(messages.join(','));
            return;
        }
        let condition = {
            recruitBatchId: this.state.pagingSearch.recruitBatchId,
            orgId: this.state.pagingSearch.partnerId,
            productId: this.state.dataModel.productId,
            productTotalPriceApply: this.state.dataModel.productTotalPriceApply,
            termPriceApplys: JSON.stringify(this.state.dic_fenqi.filter(a => a.id <= this.state.currentFenQi).map((item) => {
                return {
                    term: item.id,// - 期数
                    productTermPrice: item.money,// - 分期金额
                    courseCategoryIds: item.courseCategoryIds.join(','),//- 分期科目ID集，逗号分隔
                }
            })),
        };
        this.props.partnerProductPriceApplyCaculatorProductTermPrice(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                data.data.map((item) => {
                    let find = this.state.dic_fenqi.find(a => a.id == item.term);
                    find.money = item.productTermPrice;
                });
                //更新分期金额
                this.setState({ dic_fenqi: this.state.dic_fenqi });
            }
            else {
                message.error(data.message);
            }
        })
    };
    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }

    //选择大客户后触发
    onChangePartner = (value) =>{

        this.state.pagingSearch.partnerId = value.length ? value[0].id:"";
        this.state.dataModel.branchName = value.length ? value[0].branchName: "";//

        let partnerClassTypes = value.length ? split(value[0].partnerClassType).sort((a, b) => a > b ? 1 : -1) : [];
        this.state.dic_partnerClassTypes = this.state.partner_class_type.filter(a => partnerClassTypes.find(b => b == a.value));
        //如果就一个，则默认选择第一个
        if (partnerClassTypes.length >= 1) {
            this.state.dataModel.partnerClassType = partnerClassTypes[0];
        }
        //重置分期条件
        this.state.dic_fenqi.map(a => {
            a.money = 0;
            a.courseCategoryIds = [];
        })

        setTimeout(() => {
            {/* 重新重置才能绑定这个大客户合作方式 */ }
            this.props.form.resetFields(['productId', 'partnerClassType']);
        }, 500);
        this.setState({
            dic_fenqi: this.state.dic_fenqi,
            pagingSearch: this.state.pagingSearch,
            dataModel: this.state.dataModel,
            dic_partnerClassTypes: this.state.dic_partnerClassTypes
        });
        this.fetchPartnerContract(this.state.pagingSearch.partnerId);
        //检索大客户能看到的商品列表
        value.length && this.fetchZbProductList(this.state.pagingSearch);
    }

    //选择商品后触发
    onChangeProductForPartner = (value) => {
        this.state.dataModel.productId = value.length ? value[0].id : "";
        let productInfo = value.length ? this.state.data.find(a => a.productId == value[0].id):{};
        this.state.dataModel.productType = productInfo.productType;
        this.state.dataModel.isRehear = productInfo.isRehear;
        this.state.dataModel.classTypeName = productInfo.classTypeName;
        this.state.dataModel.productTotalPrice = productInfo.productTotalPrice;
        this.setState({ dataModel: this.state.dataModel });
        value.length && this.fetchProductPriceDetail(productInfo);
    }


    onSubmit = (isAudit) => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据
                let postData = {};
                
                if (this.props.editMode == 'Copy') {
                    values.partnerId = values.partnerId.length ? values.partnerId[0].id : '';
                    postData = {
                        //recruitBatchId: this.props.pagingSearch.recruitBatchId,
                        ...values
                    };
                    this.props.viewCallback(postData);
                }
                else if (this.props.editMode == 'Create' || this.props.editMode == 'Edit') {

                    if(values.productId){
                        values.productId =  values.productId[0].id;
                    }
                    if(values.partnerId){
                        values.partnerId = values.partnerId[0].id;
                    }

                    postData = {
                        isAudit,
                        productPriceApplyId: this.state.dataModel.productPriceApplyId,
                        recruitBatchId: this.state.pagingSearch.recruitBatchId,
                        productId: this.state.dataModel.productId,
                        productType: this.state.dataModel.productType,
                        coursePriceApplys: JSON.stringify(this.state.product_price_list.map((item) => {
                            return {
                                courseId: item.courseId,//-课程商品ID，
                                courseInitialPrice: item._coursePrice,//-课程商品标准价格（总部定价）                                
                                //coursePrice: 0,
                                coursePrice: this.state.dataModel.partnerClassType.toString() == '1' ? 0 : item.coursePrice,//方向班不需要拆项，精英班则需要。课程商品大客户协议价
                                classHour: item.classHour,//-大客户协议价-课时
                            }
                        })),
                    };
                    //方向班才设置分期缴费
                    if (this.state.dataModel.partnerClassType.toString() == '1') {
                        postData.termPriceApplys = JSON.stringify(this.state.dic_fenqi.filter(a => a.id <= this.state.currentFenQi).map((item) => {
                            return {
                                term: item.id,// - 期数
                                productTermPrice: item.money,// - 分期金额
                                courseCategoryIds: item.courseCategoryIds.join(','),//- 分期科目ID集，逗号分隔
                            }
                        }))
                    }
                    that.props.viewCallback({ ...postData, ...values });
                }
                else if (this.props.editMode == 'Delete') {
                    this.props.viewCallback({ productPriceApplyId: this.state.dataModel.productPriceApplyId });
                }
                else if (this.props.editMode == 'Audit') {
                    this.props.viewCallback({ productPriceApplyId: this.state.dataModel.productPriceApplyId, ...values });
                }
                else if (this.props.editMode == 'BatchAudit') {
                    this.props.viewCallback({ productPriceApplyIds: this.state.dataModel.join(','), ...values });
                }
            }
        });
    }
    //获取商品价格明细信息
    fetchProductPriceDetail(productPriceInfo, callback) {
        this.setState({ tableLoading: true });
        //动态根据商品类型加载数据
        if (this.state.dataModel.productType == 1) {
            this.props.recruitBindProductPriceInfoUpById(productPriceInfo.productId, productPriceInfo.recruitBatchId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    let totalCoursePrice = 0;
                    let all_CourseCategorys = [];
                    data.data.map((item) => {
                        item._coursePrice = item.coursePrice;
                        item._classHour = item.classHour;
                        totalCoursePrice += item.coursePrice;
                        if (!all_CourseCategorys.find(a => a.value == `${item.courseCategoryId}`)) {
                            all_CourseCategorys.push({ title: item.courseCategoryName, value: `${item.courseCategoryId}` })
                        }
                    })
                    if (this.props.editMode == 'Create') {
                        this.state.dataModel.productTotalPriceApply = totalCoursePrice;
                        this.state.dataModel._productTotalPriceApply = totalCoursePrice;
                        this.state.dataModel.partnerBalancePrice = totalCoursePrice;
                        this.state.dataModel._partnerBalancePrice = totalCoursePrice;
                    }
                    else {
                        this.state.dataModel._productTotalPriceApply = totalCoursePrice;
                        this.state.dataModel._partnerBalancePrice = totalCoursePrice;

                    }
                    let currentFenQi = Math.min(all_CourseCategorys.length, 4);
                    this.setState({
                        product_price_list: data.data || [],
                        dataModel: this.state.dataModel,
                        all_CourseCategorys: all_CourseCategorys,
                        currentFenQi: currentFenQi,
                        _currentFenQi: currentFenQi,
                    })
                    setTimeout(() => {
                        {/* 重新重置才能绑定这个科目值 */ }
                        this.props.form.resetFields(['productTotalPriceApply', 'partnerBalancePrice']);
                    }, 500);

                    if (callback) {
                        callback()
                    }
                    else {
                        this.setState({ tableLoading: false });
                    }
                }
            })
        }
        else {
            this.props.recruitCourseProductPriceInfoById(productPriceInfo.productId, productPriceInfo.productPriceId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    let all_CourseCategorys = [];
                    data.data = [data.data];
                    let totalCoursePrice = 0;
                    data.data.map((item) => {
                        item._coursePrice = item.productPrice;
                        item.coursePrice = item.productPrice;//名称兼容
                        item._classHour = item.classHour;
                        totalCoursePrice += item.coursePrice;
                        if (!all_CourseCategorys.find(a => a.value == `${item.courseCategryId}`)) {
                            all_CourseCategorys.push({ title: item.courseCategryName, value: `${item.courseCategryId}` })
                        }
                    })
                    this.state.dataModel.productTotalPriceApply = totalCoursePrice;
                    this.state.dataModel._productTotalPriceApply = totalCoursePrice;
                    this.state.dataModel.partnerBalancePrice = totalCoursePrice;
                    this.state.dataModel._partnerBalancePrice = totalCoursePrice;
                    let currentFenQi = Math.max(all_CourseCategorys.length, 1);
                    this.setState({
                        product_price_list: data.data || [],
                        dataModel: this.state.dataModel,
                        all_CourseCategorys: all_CourseCategorys,
                        currentFenQi: currentFenQi,
                        _currentFenQi: currentFenQi,
                    })
                    setTimeout(() => {
                        {/* 重新重置才能绑定这个科目值 */ }
                        this.props.form.resetFields(['productTotalPriceApply', 'partnerBalancePrice']);
                    }, 500);

                    if (callback) {
                        callback()
                    }
                    else {
                        this.setState({ tableLoading: false });
                    }
                }
            })
        }
    }
    //计算价格
    calcTotalStandardPrice = (auto) => {
        this.props.form.resetFields(['feiqiSetting', 'coursePrices'])
        let _totalCoursePrice = this.state.dataModel._productTotalPriceApply;//原始总价
        let totalCoursePrice = this.state.dataModel.productTotalPriceApply;//新的协议价
        let lastCoursePrice = 0;
        if (auto) {
            this.state.product_price_list.map((item, index) => {
                if (index + 1 < this.state.product_price_list.length) {
                    item.coursePrice = ((item._coursePrice * 1.00) / _totalCoursePrice * totalCoursePrice).toFixed(2);
                    lastCoursePrice += parseFloat(item.coursePrice);
                }
                else {
                    item.coursePrice = (totalCoursePrice - lastCoursePrice).toFixed(2);//剩余金额
                }
            })
        }
        else {
            this.state.product_price_list.map((item, index) => {
                if (index + 1 < this.state.product_price_list.length) {
                    if (lastCoursePrice >= totalCoursePrice) {
                        item.coursePrice = 0;
                    }
                    lastCoursePrice += parseFloat(item.coursePrice);
                }
                else {
                    item.coursePrice = (totalCoursePrice - lastCoursePrice).toFixed(2);//剩余金额
                }
            })
        }
        this.setState({ product_price_list: this.state.product_price_list })
    }
    //计算分期价格
    calcFeiqiPrice = () => {
        this.props.form.resetFields(['feiqiSetting', 'coursePrices'])
        let totalCoursePrice = this.state.dataModel.productTotalPriceApply;//新的协议价
        let lastCoursePrice = 0;
        this.state.dic_fenqi
            .filter((a) => { return a.id <= this.state.currentFenQi })
            .map((item, index) => {
                if (item.id < this.state.currentFenQi) {
                    if (lastCoursePrice >= totalCoursePrice) {
                        item.money = 0;
                    }
                    lastCoursePrice += parseInt(item.money);
                }
                else {
                    item.money = (totalCoursePrice - lastCoursePrice);//剩余金额
                }
            })
        this.setState({ dic_fenqi: this.state.dic_fenqi })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        if (this.props.editMode == 'Copy') {
            op = '复制'
        }
        else if (this.props.editMode == 'Audit' || this.props.editMode == 'BatchAudit') {
            op = "审核"
        }
        return `${op}大客户商品协议价`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'Copy') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="copy" onClick={this.onSubmit}>复制</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        if (this.props.editMode == 'Create' || this.props.editMode == 'Edit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.state.dataModel.productId && <Button type="primary" loading={this.state.loading} icon="save" onClick={() => { this.onSubmit(0) }}>保存</Button>}
                {!this.state.dataModel.productId && <Button type="primary" disabled icon="save">保存</Button>}
                <span className="split_button"></span>
                {this.state.dataModel.productId && <Button type="primary" loading={this.state.loading} icon="save" onClick={() => { this.onSubmit(1) }}>保存并提交审核</Button>}
                {!this.state.dataModel.productId && <Button type="primary" disabled icon="save">保存并提交审核</Button>}
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        if (this.props.editMode == 'BatchAudit') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '提交')}</Button>
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.state.dataModel.productId && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '提交')}</Button>}
                {!this.state.dataModel.productId && <Button type="primary" disabled icon="save" >{getViewEditModeTitle(this.props.editMode, '提交')}</Button>}
                <span className="split_button"></span>
                <Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Copy":
                let compareToSourceRecruitBatchId = (rule, value, callback) => {
                    const form = this.props.form;
                    if (value == '') {
                        callback(rule.message);
                    }
                    else if (value === form.getFieldValue('fromRecruitBatchId')) {
                        callback('目的招生季不能与源招生季相同!');
                    } else {
                        callback();
                    }
                }

                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="项目" >
                                    {getFieldDecorator('itemId', { initialValue: '' })(
                                        <SelectItem scope='my' hideAll={false} />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="大客户名称" >
                                {getFieldDecorator('partnerId', { initialValue: '' })(
                                    <EditablePowerPartnerTagGroup maxTags={1} />
                                )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="源招生季">
                                    {getFieldDecorator('fromRecruitBatchId', {
                                        initialValue: dataBind(this.state.dataModel.productId),
                                        rules: [{
                                            required: true, message: '请选择源招生季!',
                                        }],
                                    })(
                                        <SelectRecruitBatch hideAll={true} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="目的招生季">
                                    {getFieldDecorator('toRecruitBatchId', {
                                        initialValue: dataBind(this.state.dataModel.productId),
                                        rules: [{
                                            required: true, message: '请选择目的招生季!',
                                            validator: compareToSourceRecruitBatchId,
                                        }],
                                    })(
                                        <SelectRecruitBatch hideAll={true} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>);
                break;
            case "Create":
            case "Edit":
                let columnsPriceEdit01 = [
                    {
                        title: '课程商品名称',
                        dataIndex: 'productName',
                    },
                    {
                        title: '标准定价（¥）',
                        //自定义显示
                        render: (text, record, index) => (`${formatMoney(record._coursePrice)}`)
                    },
                    {
                        title: '标准课时',
                        dataIndex: '_classHour',
                    },
                    {
                        title: <div>课时<span style={{ color: 'red' }}>*</span></div>,
                        //自定义显示
                        render: (text, record, index) => {
                            return <InputNumber min={1} step={1} value={record.classHour}
                                onChange={(value) => {
                                    if (isNaN(value) || value == '') {
                                        record.classHour = 0;
                                    }
                                    else {
                                        record.classHour = parseInt(value);
                                    }
                                    this.setState({ product_price_list: this.state.product_price_list });
                                }} />
                        }
                    },
                ];
                let columnsPriceEdit02 = [
                    {
                        title: '课程商品名称',
                        dataIndex: 'productName',
                    },
                    {
                        title: '标准定价（¥）',
                        //自定义显示
                        render: (text, record, index) => (`${formatMoney(record._coursePrice)}`)
                    },
                    {
                        title: '标准课时',
                        dataIndex: '_classHour',
                    },
                    {
                        title: <div>分项价格(¥)<span style={{ color: 'red' }}>*</span></div>,
                        //自定义显示
                        render: (text, record, index) => ((this.state.product_price_list.length > 1 && index + 1 == this.state.product_price_list.length) ? <InputNumber disabled min={0} step={1} value={record.coursePrice} /> : <InputNumber min={0} step={1} value={record.coursePrice}
                            onChange={(value) => {
                                if (isNaN(value) || value == '') {
                                    record.coursePrice = 0;
                                }
                                else {
                                    record.coursePrice = parseInt(value);
                                }
                                this.setState({ product_price_list: this.state.product_price_list }, () => {
                                    //更新价格
                                    this.calcTotalStandardPrice();
                                });
                            }} />)
                    },
                    {
                        title: <div>课时<span style={{ color: 'red' }}>*</span></div>,
                        //自定义显示
                        render: (text, record, index) => {
                            return <InputNumber min={1} step={1} value={record.classHour}
                                onChange={(value) => {
                                    if (isNaN(value) || value == '') {
                                        record.classHour = 0;
                                    }
                                    else {
                                        record.classHour = parseInt(value);
                                    }
                                    this.setState({ product_price_list: this.state.product_price_list });
                                }} />
                        }
                    },
                ];
                let columnsFenqiEdit = [
                    {
                        title: '分期',
                        dataIndex: 'productName',
                        width: 150,
                        render: (text, record, index) => (`第${index + 1}期`)
                    },
                    {
                        title: <div>开通科目设置<span style={{ color: 'red' }}>*</span></div>,
                        className: 'left',
                        //自定义显示
                        render: (text, record, index) => {
                            //筛选出本行可用的选项
                            let existCourseCategoryIds = [];
                            this.state.dic_fenqi
                                .filter((item, i) => {
                                    return i != index;
                                })
                                .map((a) => {
                                    existCourseCategoryIds = [...existCourseCategoryIds, ...a.courseCategoryIds]
                                });

                            return (<CheckboxGroup value={record.courseCategoryIds} onChange={(values) => {
                                record.courseCategoryIds = values;
                                this.setState({ dic_fenqi: this.state.dic_fenqi });
                                this.props.form.resetFields(['feiqiSetting', 'coursePrices'])
                            }}>
                                {
                                    this.state.all_CourseCategorys.map((item, _index) => {
                                        if (existCourseCategoryIds.find(a => a == item.value) || index + 1 > this.state.all_CourseCategorys.length) {
                                            return <Checkbox value={item.value} disabled key={_index}>{item.title}</Checkbox>
                                        }
                                        else {
                                            return <Checkbox value={item.value} key={_index}>{item.title}</Checkbox>
                                        }
                                    })
                                }
                            </CheckboxGroup>)
                        }
                    },
                    {
                        title: <div>分期缴费金额（¥）<span style={{ color: 'red' }}>*</span></div>,
                        width: 150,
                        //自定义显示
                        render: (text, record, index) => ((this.state.product_price_list.length > 1 && index + 1 == this.state.currentFenQi || index + 1 > this.state.all_CourseCategorys.length) ? <InputNumber disabled min={0} step={1} value={record.money} /> : <InputNumber min={0} step={1} value={record.money}
                            onChange={(value) => {
                                if (isNaN(value) || value == '') {
                                    record.money = 0;
                                }
                                else {
                                    record.money = parseInt(value);
                                }
                                this.setState({ dic_fenqi: this.state.dic_fenqi }, () => {
                                    //更新分期价格
                                    this.calcFeiqiPrice();
                                });
                            }} />)
                    },
                ];
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="招生季">
                                    {getFieldDecorator('recruitBatchId', {
                                        initialValue: ''
                                    })(
                                        <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value });
                                            this.state.pagingSearch.recruitBatchId = value;//招生季ID
                                            this.state.dataModel.productId = "";
                                            //重置分期条件
                                            this.state.dic_fenqi.map(a => {
                                                a.money = 0;
                                                a.courseCategoryIds = [];
                                            })
                                            this.setState({
                                                pagingSearch: this.state.pagingSearch,
                                                dic_fenqi: this.state.dic_fenqi,
                                            });
                                            setTimeout(() => {
                                                {/* 重新重置才能绑定这个科目值 */ }
                                                this.props.form.resetFields(['productId']);
                                            }, 500);
                                            if(this.state.pagingSearch.partnerId){
                                                this.fetchZbProductList(this.state.pagingSearch);
                                            }
                                            

                                        }} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label={<span className='formItemEmpty'></span>}//空占位
                                    colon={false}  //不显示':'
                                >
                                </FormItem>
                            </Col>
                            {this.props.editMode == 'Edit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="招生季"
                                >
                                    {this.state.dataModel.recruitBatchName}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="大客户" >
                                    {getFieldDecorator('partnerId', {
                                        initialValue: '', rules: [{
                                            required: true, message: '请选择大客户!',
                                        }],
                                    })(
                                        <EditablePowerPartnerTagGroup maxTags={1} onChange={this.onChangePartner}/>
                                        // <SelectPartnerOrg scope='my' hideAll={true}
                                        //     onSelectChange={(value, selectOptions) => {
                                        //         this.state.pagingSearch.partnerId = value
                                        //         this.state.dataModel.branchName = selectOptions.branchName;//

                                        //         let partnerClassTypes = split(selectOptions.partnerClassType).sort((a, b) => a > b ? 1 : -1);
                                        //         this.state.dic_partnerClassTypes = this.state.partner_class_type.filter(a => partnerClassTypes.find(b => b == a.value));
                                        //         //如果就一个，则默认选择第一个
                                        //         if (partnerClassTypes.length >= 1) {
                                        //             this.state.dataModel.partnerClassType = partnerClassTypes[0];
                                        //         }
                                        //         //重置分期条件
                                        //         this.state.dic_fenqi.map(a => {
                                        //             a.money = 0;
                                        //             a.courseCategoryIds = [];
                                        //         })

                                        //         setTimeout(() => {
                                        //             {/* 重新重置才能绑定这个大客户合作方式 */ }
                                        //             this.props.form.resetFields(['productId', 'partnerClassType']);
                                        //         }, 500);
                                        //         this.setState({
                                        //             dic_fenqi: this.state.dic_fenqi,
                                        //             pagingSearch: this.state.pagingSearch,
                                        //             dataModel: this.state.dataModel,
                                        //             dic_partnerClassTypes: this.state.dic_partnerClassTypes
                                        //         });
                                        //         this.fetchPartnerContract(value);
                                        //         //检索大客户能看到的商品列表
                                        //         this.fetchZbProductList(this.state.pagingSearch);
                                        //     }}
                                        // />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="大客户"
                                >
                                    {this.state.dataModel.orgName}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="所属分部" >
                                    {this.state.dataModel.branchName}
                                </FormItem>
                            </Col>
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品"
                                >
                                    {getFieldDecorator('productId', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请选择商品!',
                                        }],
                                    })(
                                        <EditableProductForPartner maxTags={1} onChange={this.onChangeProductForPartner} pagingSearch={ this.state.pagingSearch }/>
                                        // <Select
                                        //     showSearch={true}
                                        //     filterOption={(inputValue, option) => {
                                        //         return (option.props.children.indexOf(inputValue) != -1);
                                        //     }}
                                        //     onChange={(value, selectOptions) => {
                                        //         this.state.dataModel.productId = value;
                                        //         let productInfo = this.state.data.find(a => a.productId == value);
                                        //         this.state.dataModel.productType = productInfo.productType;
                                        //         this.state.dataModel.isRehear = productInfo.isRehear;
                                        //         this.state.dataModel.classTypeName = productInfo.classTypeName;
                                        //         this.state.dataModel.productTotalPrice = productInfo.productTotalPrice;
                                        //         this.setState({ dataModel: this.state.dataModel });
                                        //         this.fetchProductPriceDetail(productInfo);//加载商品价格明细
                                        //     }}>
                                        //     {this.state.data.map((item, index) => {
                                        //         return <Option value={`${item.productId}`} key={index} title={item.productName}>{item.productName}</Option>
                                        //     })}
                                        // </Select>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品名称"
                                >
                                    {this.state.dataModel.productName}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="班型"
                                >
                                    {this.state.dataModel.classTypeName}
                                </FormItem>
                            </Col>

                            {(true || this.state.dataModel.productId) && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品属性"
                                >
                                    {getDictionaryTitle(this.state.producttype, this.state.dataModel.productType)}
                                </FormItem>
                            </Col>
                            }
                            {(true || this.state.dataModel.productId) && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="重听"
                                >
                                    {getDictionaryTitle(this.state.dic_Allow, this.state.dataModel.isRehear)}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合作方式"
                                >
                                    {getFieldDecorator('partnerClassType', {
                                        initialValue: dataBind(this.state.dataModel.partnerClassType),
                                        rules: [{
                                            required: true, message: '请选择合作方式!',
                                        }],
                                    })(
                                        <Select onChange={(value) => {
                                            this.state.dataModel.partnerClassType = value;
                                            this.setState({ dataModel: this.state.dataModel });
                                        }}>
                                            {this.state.dic_partnerClassTypes.map((item, index) => {
                                                return <Option value={`${item.value}`} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合作方式"
                                >
                                    {getDictionaryTitle(this.state.partner_class_type, this.state.dataModel.partnerClassType)}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="适用合同"
                                >
                                    {getFieldDecorator('partnerContractId', {
                                        initialValue: dataBind(this.state.dataModel.partnerContractId),
                                        rules: [{
                                            required: false, message: '请选择适用合同!',
                                        }],
                                    })(
                                        <Select>
                                            {this.state.PartnerContractList.map((item, index) => {
                                                return <Option value={`${item.partnerContractId}`} key={index}>{item.partnerContractName}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="适用合同"
                                >
                                    {this.state.dataModel.partnerContractName}
                                </FormItem>
                            </Col>
                            }

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="协议价格¥"
                                >
                                    {getFieldDecorator('productTotalPriceApply', {
                                        initialValue: this.state.dataModel.productTotalPriceApply ? Math.round(this.state.dataModel.productTotalPriceApply):0,
                                        rules: [{
                                            required: true, message: '请设置协议价格!',
                                        }],
                                    })(<InputNumber
                                        min={0}
                                        step={1}
                                        onChange={(value) => {
                                            if (isNaN(value) || value == '') {
                                                this.state.dataModel.productTotalPriceApply = 0;
                                            }
                                            else {
                                                this.state.dataModel.productTotalPriceApply = parseInt(value);
                                            }
                                            //同步价格更新
                                            this.state.dataModel.partnerBalancePrice = this.state.dataModel.productTotalPriceApply;
                                            this.setState({ dataModel: this.state.dataModel });
                                            setTimeout(() => {
                                                {/* 重新重置才能绑定这个科目值 */ }
                                                this.props.form.resetFields(['productTotalPriceApply', 'partnerBalancePrice']);
                                            }, 500);

                                        }} />
                                        )}
                                    {(this.state.dataModel.partnerClassType && this.state.dataModel.partnerClassType.toString() == '2' && this.state.dataModel.productTotalPriceApply > 0) && <Button
                                        onClick={() => {
                                            this.calcTotalStandardPrice(true);//自动拆分价格
                                        }}
                                        style={{ marginLeft: 10 }}
                                    >折算分项价格</Button>
                                    }
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="第三方结算价格¥"
                                >
                                    {getFieldDecorator('partnerBalancePrice', {
                                        initialValue: this.state.dataModel.partnerBalancePrice ? Math.round(this.state.dataModel.partnerBalancePrice):0,
                                        rules: [{
                                            required: true, message: '请设置第三方结算价格!',
                                        }],
                                    })(
                                        <InputNumber min={0} step={1} />
                                        )}
                                </FormItem>
                            </Col>
                            {this.state.dataModel.partnerClassType && this.state.dataModel.partnerClassType.toString() == '1' && this.state.tableLoading && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分期设置">
                                    <Spin />
                                </FormItem>
                            </Col>
                            }
                            {(this.state.dataModel.partnerClassType && this.state.dataModel.partnerClassType.toString() == '1' && !this.state.tableLoading && this.state.all_CourseCategorys.length > 0) && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分期设置"
                                >
                                    {getFieldDecorator('feiqiSetting', {
                                        rules: [{
                                            required: false,
                                            message: '请检查分期设置!',
                                            validator: (rule, value, callback) => {
                                                var messages = [];
                                                var chooseAllCourseCategoryIds = [];

                                                var totalFenqiPrice = 0;
                                                this.state.dic_fenqi.filter(a => a.id <= this.state.currentFenQi).map((item) => {
                                                    if (item.money == 0) {
                                                        messages.push(`第${item.id}期,未设置分期缴费金额`)
                                                    }
                                                    else {
                                                        totalFenqiPrice += (item.money);
                                                        if (totalFenqiPrice > this.state.dataModel.productTotalPriceApply) {
                                                            messages.push(`第${item.id}期,分期缴费金额设置累加超过协议价格`)
                                                        }
                                                    }
                                                    if (item.courseCategoryIds.length == 0) {
                                                        messages.push(`第${item.id}期,未设置开通科目`)
                                                    }
                                                    chooseAllCourseCategoryIds = [...chooseAllCourseCategoryIds, ...item.courseCategoryIds];
                                                });
                                                //如果选择的项目id总和不等于所有项目数，则提示
                                                if (chooseAllCourseCategoryIds.length != this.state.all_CourseCategorys.length) {
                                                    messages.push(`所有的开通科目设置有遗漏未勾选`)
                                                }
                                                if (messages.length > 0) {
                                                    rule.message = messages.join(';');
                                                    callback(messages[0])
                                                }
                                                else {
                                                    callback();
                                                }
                                            }
                                        }],
                                    })(
                                        <Table
                                            showHeader={true}
                                            title={() => <FormItem
                                                {...searchFormItemLayout}
                                                label="缴费分期"
                                                style={{ margin: 0 }}
                                            >
                                                <Select style={{ width: 100 }} value={this.state._currentFenQi} onChange={(value) => {
                                                    this.setState({ _currentFenQi: parseInt(value) })
                                                }}>
                                                    {this.state.dic_fenqi
                                                        .filter(a => a.id <= this.state.all_CourseCategorys.length)
                                                        .map((item, index) => {
                                                            return <Option value={item.id}>{item.id}</Option>
                                                        })}
                                                </Select><Button style={{ marginLeft: 10 }} onClick={() => {
                                                    //fixed 如果分期缩小，则重置分期项目设置
                                                    this.state.dic_fenqi
                                                        .filter(a => a.id >= this.state._currentFenQi)
                                                        .map((item, index) => {
                                                            item.courseCategoryIds = [];
                                                        })
                                                    this.setState({
                                                        dic_fenqi: this.state.dic_fenqi,
                                                        currentFenQi: this.state._currentFenQi
                                                    }, () => {
                                                        //更新分期价格
                                                        this.calcFeiqiPrice();
                                                    })
                                                }}>设置</Button>
                                                {/* <Button style={{ marginLeft: 20 }} onClick={() => {
                                                    this.fetchProductTermPrice()
                                                }}>查看分期金额</Button> */}
                                            </FormItem>}
                                            columns={columnsFenqiEdit} //列定义
                                            pagination={false}
                                            dataSource={this.state.dic_fenqi.filter(a => a.id <= this.state.currentFenQi)}//数据
                                            bordered
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {(this.state.dataModel.partnerClassType && this.state.tableLoading) && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分项价格¥">
                                    <Spin />
                                </FormItem>
                            </Col>
                            }
                            {(this.state.dataModel.partnerClassType && this.state.dataModel.productId && !this.state.tableLoading) && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分项价格¥"
                                >
                                    {getFieldDecorator('coursePrices', {
                                        rules: [{
                                            required: false,
                                            message: '请检查分项价格设置!',
                                            validator: (rule, value, callback) => {
                                                var messages1 = [];
                                                var totalCoursePrice = 0;
                                                this.state.product_price_list.map((item) => {
                                                    /*
                                                    if (parseFloat(item.coursePrice) == 0) {
                                                        messages1.push(`${item.productName},未设置分项价格`)
                                                    }
                                                    else {
                                                        totalCoursePrice += parseFloat(item.coursePrice);
                                                        if (totalCoursePrice > this.state.dataModel.productTotalPriceApply) {
                                                            messages1.push(`${item.productName},分项价格设置累加超过协议价格`)
                                                        }
                                                    }*/
                                                    if (item.classHour == 0) {
                                                        messages1.push(`${item.productName},未设置课时`)
                                                    }
                                                })
                                                if (messages1.length > 0) {
                                                    rule.message = messages1.join(';');
                                                    callback(messages1[0])
                                                }
                                                else {
                                                    callback();
                                                }
                                            }
                                        }],
                                    })(
                                        <Table columns={(this.state.dataModel.partnerClassType && this.state.dataModel.partnerClassType.toString() == '1') ? columnsPriceEdit01 : columnsPriceEdit02} //列定义
                                            pagination={false}
                                            dataSource={this.state.product_price_list}//数据
                                            rowKey={record => record.productPriceId}//主键
                                            bordered
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="备注"
                                >
                                    {getFieldDecorator('applyReason', {
                                        initialValue: this.state.dataModel.applyReason,
                                        rules: [{
                                            required: false, message: '请设置备注!',
                                        }],
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                );
                break;
            case "View":
            case 'Delete':
            case "Audit":
                let columnsPriceView = [
                    {
                        title: '课程商品名称',
                        dataIndex: 'courseName',
                    },
                    {
                        title: '分项价格（¥）',
                        //自定义显示
                        render: (text, record, index) => (`${formatMoney(record.coursePrice)}`)
                    },
                    {
                        title: '学时',
                        dataIndex: 'classHour',
                    },
                ];
                let columnsFenqiView = [
                    {
                        title: '分期',
                        dataIndex: 'productName',
                        render: (text, record, index) => (`第${record.term}期`)
                    },
                    {
                        title: '开通科目',
                        className: 'left',
                        //自定义显示
                        render: (text, record, index) => {
                            return record.courseCategoryNames
                        }
                    },
                    {
                        title: '分期缴费金额（¥）',
                        //自定义显示
                        render: (text, record, index) => (`${formatMoney(record.productTermPrice)}`)
                    },
                ];
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="招生季"
                                >
                                    {this.state.dataModel.recruitBatchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="大客户名称"
                                >
                                    {this.state.dataModel.orgName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属分部"
                                >
                                    {this.state.dataModel.branchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品名称"
                                >
                                    {this.state.dataModel.productName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="班型"
                                >{this.state.dataModel.classTypeName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品属性"
                                >
                                    {getDictionaryTitle(this.state.producttype, this.state.dataModel.productType)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="重听"
                                >
                                    {getDictionaryTitle(this.state.dic_Allow, this.state.dataModel.isRehear)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合作方式"
                                >
                                    {getDictionaryTitle(this.state.partner_class_type, this.state.dataModel.partnerClassType)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="适用合同"
                                >
                                    {this.state.dataModel.partnerContractName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品协议价格¥"
                                >
                                    {formatMoney(this.state.dataModel.productTotalPriceApply)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品结算价格¥"
                                >
                                    {formatMoney(this.state.dataModel.partnerBalancePrice)}
                                </FormItem>
                            </Col>
                            {/* 方向班才有分期 */}
                            {this.state.dataModel.partnerClassType == 1 && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分期设置"
                                >
                                    {this.state.tableLoading && <Spin />}
                                    {!this.state.tableLoading && <Table
                                        columns={columnsFenqiView} //列定义
                                        pagination={false}
                                        dataSource={this.state.dataModel.productTermPriceApplyLst}//数据
                                        bordered
                                    />}
                                </FormItem>
                            </Col>
                            }
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="分项价格¥"
                                >
                                    {this.state.tableLoading && <Spin />}
                                    {!this.state.tableLoading && <Table
                                        columns={columnsPriceView} //列定义
                                        pagination={false}
                                        dataSource={this.state.dataModel.productCoursePriceApplyLst}//数据
                                        bordered
                                    />
                                    }
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="备注"
                                >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="创建人/日期"
                                >
                                    {`${this.state.dataModel.createUName}/${timestampToTime(this.state.dataModel.createDate)} `}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="最新提交审核日期"
                                >
                                    {
                                        timestampToTime(this.state.dataModel.modifyDate)
                                    }
                                </FormItem>
                            </Col>
                            {this.state.dataModel.auditLog && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="审核情况"
                                >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditLog) }}></span>
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核结果"
                                >
                                    {getFieldDecorator('auditStatus', {
                                        rules: [{
                                            required: true, message: '请选择审核结果!',
                                        }],
                                    })(
                                        <RadioGroup>
                                            <Radio value={2} key={1}>审核通过</Radio>
                                            <Radio value={3} key={2}>审核不通过</Radio>
                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核意见"
                                >
                                    {getFieldDecorator('auditReason', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请输入此次审核意见!',
                                        }],
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                        </Row>
                    </Form >
                );
                break;
            case "BatchAudit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="批量审核"
                                >
                                    {`您选择了${this.state.dataModel.length}个大客户商品协议定价进行审核`}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核结果"
                                >
                                    {getFieldDecorator('auditStatus', {
                                        rules: [{
                                            required: true, message: '请选择审核结果!',
                                        }],
                                    })(
                                        <RadioGroup>
                                            <Radio value={2} key={1}>审核通过</Radio>
                                            <Radio value={3} key={2}>审核不通过</Radio>
                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核意见"
                                >
                                    {getFieldDecorator('auditReason', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请输入此次审核意见!',
                                        }],
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form >
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(ProductPriceApplyView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

        partnerProductPriceApplyGetById: bindActionCreators(partnerProductPriceApplyGetById, dispatch),
        getPartnerContractList: bindActionCreators(getPartnerContractList, dispatch),
        recruitProductPriceList: bindActionCreators(recruitProductPriceList, dispatch),

        partnerProductPriceApplyCaculatorProductTermPrice: bindActionCreators(partnerProductPriceApplyCaculatorProductTermPrice, dispatch),
        partnerProductPriceApplySearchZPriceForPartner: bindActionCreators(partnerProductPriceApplySearchZPriceForPartner, dispatch),

        recruitBindProductPriceInfoUpById: bindActionCreators(recruitBindProductPriceInfoUpById, dispatch),
        recruitCourseProductPriceInfoById: bindActionCreators(recruitCourseProductPriceInfoById, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
