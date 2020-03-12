/*
限价编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Table, Input, Select, Button, Icon, DatePicker, InputNumber, message } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

import {
    batchLimitPrice
} from '@/actions/recruit';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]{productId,productType,recruitBatchId,productPriceId}
viewCallback [回调]
*/
class ProductPriceView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel,//数据模型
            data: [],
            limitPriceType: 0
        };
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'dic_Allow', 'rehear_type', 'producttype', 'teachmode']);

        this.setState({ limitPriceType: this.state.dataModel.productLimitTypeFlag });

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

                let productPriceLimits = [{
                    productPriceLimitId: that.state.dataModel.productPriceLimitId,
                    productId: that.state.dataModel.productId,
                }];

                values.flag = 1;
                values.productPriceLimits = JSON.stringify(productPriceLimits);

                that.props.batchLimitPrice(values).payload.promise.then((response) => {
                    let data = response.payload.data;
                    that.setState({ loading: false });
                    if (data.state === 'error') {
                        message.error(data.msg, 5);
                    }
                    else {
                        message.success('修改成功');
                        that.props.viewCallback();
                    }
                })
               
            }
        });
    }
    //标题
    getTitle() {
        //加载最新的数据
        let op = `${this.props.editMode == 'Edit' ? '修改' : '查看'}`
        
        return `商品限价及特价申请开放情况${op}`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
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
                                    label="商品属性"
                                >
                                    {this.state.dataModel.productType}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属班型"
                                >
                                    {this.state.dataModel.classTypeName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="相关项目"
                                >
                                    {this.state.dataModel.itemName}
                                </FormItem>
                            </Col>
                            
                            <Col span={12} >
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品限价情况"
                                >
                                    {getFieldDecorator('productLimitType', { 
                                        initialValue: this.state.dataModel.productLimitTypeFlag,
                                        rules: [{
                                            required: true, message: '请选择限价情况!',
                                        }],
                                     })(
                                        <Select onChange={(value) => {
                                                this.setState({
                                                    limitPriceType: value
                                                })
                                        }}>
                                            {this.props.price_limit.filter(a => a.value != 0).map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12} >
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="特价申请"
                                >
                                    {getFieldDecorator('branchPriceOpenFlag', { 
                                        initialValue: (this.state.dataModel.branchPriceOpenFlag == null || this.state.dataModel.branchPriceOpenFlag == 1) ? '1' : '0',
                                        rules: [{
                                            required: true, message: '请选择特价申请!',
                                        }],
                                     })(
                                        <Select>
                                            {this.props.price_open_flag.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            {
                                this.state.limitPriceType == 2 ? <div>
                                <Col span={12} >
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="限价金额"
                                    >
                                        {getFieldDecorator('productLimitPrice', { 
                                            initialValue: this.state.dataModel.productLimitPrice,
                                            rules: [{
                                                required: true, message: '请输入限价金额!',
                                            }],
                                        })(
                                            <InputNumber min={1} step={1} style={{width:150}} placeholder='请输入限价金额' />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12} >
                                </Col>
                                </div>
                                :
                                ''
                            }
                            {
                                this.state.limitPriceType == 1 ? <div>
                                    <Col span={12} >
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="限价比例"
                                        >
                                            {getFieldDecorator('productLimitPrice', { 
                                                initialValue: Number(this.state.dataModel.productLimitPrice),
                                                rules: [{
                                                    required: true, message: '请输入限价比例!',
                                                }],
                                            })(
                                                <InputNumber min={1} max={100} step={1} style={{width:150}} placeholder='请输入限价比例' />
                                            )}
                                            &nbsp;%
                                        </FormItem>
                                    </Col>
                                    <Col span={12} >
                                    </Col>
                                </div>
                                :
                                ''
                            }
                            
                            
                        </Row>
                    </Form>
                );
                break;

        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(ProductPriceView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        batchLimitPrice: bindActionCreators(batchLimitPrice, dispatch),

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
