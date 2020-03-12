/*
招生季编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Table, Radio, Input, Button, Icon, DatePicker, InputNumber, Select } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, convertTextToHtml } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

import {
    getByProductPriceApplyRelevanceZ
} from '@/actions/recruit';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
import ProductView from '@/views/ZB/Product/ProductView/view'
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
            editMode: props.editMode,
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
        };
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode']);

        if (this.props.editMode != 'Create') {
            //加载最新信息
            this.props.getByProductPriceApplyRelevanceZ({ productPriceApplyId: this.state.dataModel.productPriceApplyId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    this.setState({
                        dataModel: { ...data.data }
                    })
                }
            })
        }
    }
    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据
                let postData = {
                    productPriceApplyId: this.state.dataModel.productPriceApplyId,
                    auditStatus: values.auditStatus,
                    auditReason: values.auditReason,
                };
                that.props.viewCallback(postData);
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}商品特价申请`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.state.dataModel.productId && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>}
                {!this.state.dataModel.productId && <Button type="primary" disabled icon="save" >{getViewEditModeTitle(this.props.editMode)}</Button>}
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

    //浏览视图
    onLookView = (op, item) => {
        this.setState({
            editMode: op,//编辑模式
            currentDataModel: item,//编辑对象
        });
    };
    //视图回调
    onViewCallback = (dataModel) => {
        if (!dataModel) {
            this.setState({ currentDataModel: null, editMode: this.props.editMode })
        } else {
            switch (this.state.editMode) {
                case 'Audit':
                    this.props.getFirstAuditZ(dataModel).payload.promise.then((response) => {
                        let data = response.payload.data;
                        if (data.state === 'error') {
                            message.error(data.message);
                        }
                        else {
                            this.onSearch();
                            //进入管理页
                            this.onLookView("Manage", null);
                        }
                    });
                    break;
            }
        }
    }

    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.state.editMode) {
            case "View":
            case "Audit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="招生季"
                                >
                                    {this.state.dataModel.recruitBatchName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="班型"
                                >
                                    {this.state.dataModel.classTypeName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品名称"
                                >
                                    <a onClick={() => {
                                        this.onLookView('ProductView', this.state.dataModel);
                                    }}>{this.state.dataModel.productName}</a>
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
                                    label="包含课程数"
                                >
                                    {this.state.dataModel.courseCount}
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
                                    label="商品标价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPrice)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品最低限价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productLimitPrice)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请特价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPriceApply)}</span>   
                                    {this.state.dataModel.productLimitPrice? (Number(this.state.dataModel.productLimitPrice).toFixed(2) - Number(this.state.dataModel.productTotalPriceApply).toFixed(2) >0 ? '( 申请特价小于商品最低限价)':''):(Number(this.state.dataModel.productTotalPrice).toFixed(2) - Number(this.state.dataModel.productTotalPriceApply).toFixed(2)) >0 ? '( 申请特价小于商品标价)':''}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请人"
                                >
                                    {this.state.dataModel.userName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请日期"
                                >
                                    {timestampToTime(this.state.dataModel.applyDate)}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="申请理由"
                                >
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.applyReason) }}></span>
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
                        </Row>

                        {(this.props.editMode == 'Audit' && !this.state.dataModel.isFinalAudit) && <Row gutter={24}>
                            <Col span={24} className='center'>请初审</Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="初审结果"
                                >
                                    {getFieldDecorator('auditStatus', {
                                        initialValue: dataBind(this.state.dataModel.auditStatus),
                                        rules: [{
                                            required: true, message: '请选择初审结果!',
                                        }],
                                    })(
                                        <RadioGroup>
                                            <Radio value={1} key={1}>审核通过</Radio>
                                            <Radio value={0} key={2}>审核不通过</Radio>
                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="初审意见"
                                >
                                    {getFieldDecorator('auditReason', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请设置初审意见!',
                                        }],
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                        }
                        {
                            (this.props.editMode == 'Audit' && this.state.dataModel.isFinalAudit == 1) && <Row gutter={24}>
                                <Col span={24} className='center'>请终审</Col>
                                <Col span={24}>
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        label="终审结果"
                                    >
                                        {getFieldDecorator('auditStatus', {
                                            initialValue: dataBind(this.state.dataModel.auditStatus),
                                            rules: [{
                                                required: true, message: '请选择终审结果!',
                                            }],
                                        })(
                                            <RadioGroup>
                                                <Radio value={1} key={1}>审核通过</Radio>
                                                <Radio value={0} key={2}>审核不通过</Radio>
                                            </RadioGroup>
                                            )}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        label="终审意见"
                                    >
                                        {getFieldDecorator('auditReason', {
                                            initialValue: '',
                                            rules: [{
                                                required: true, message: '请设置终审意见!',
                                            }],
                                        })(
                                            <TextArea rows={4} />
                                            )}
                                    </FormItem>
                                </Col>
                            </Row>
                        }
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        if (this.state.editMode == 'ProductView') {
            return <ProductView
                viewCallback={this.onViewCallback}
                currentDataModel={this.state.dataModel}
                editMode={'View'}
            />
        }
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

        getByProductPriceApplyRelevanceZ: bindActionCreators(getByProductPriceApplyRelevanceZ, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
