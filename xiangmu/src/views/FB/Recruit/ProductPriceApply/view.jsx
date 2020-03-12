/*
招生季编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, message, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber, Select } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, convertTextToHtml } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

import {
    getByProductPriceApplyRelevanceF, recruitProductPriceListFB
} from '@/actions/recruit';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import SelectItem from '@/components/BizSelect/SelectItem';
import SelectClassType from '@/components/BizSelect/SelectClassType';
import SelectRecruitBatch from '@/components/BizSelect/SelectRecruitBatch';
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
            InputNum:false,
            dataModel: props.currentDataModel,//数据模型
            pagingSearch: {
                LimitPrice:'',
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

        if (this.props.editMode != 'Create' && this.props.editMode != 'QuickApply') {
            //加载最新信息
            this.props.getByProductPriceApplyRelevanceF({ productPriceApplyId: this.state.dataModel.productPriceApplyId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else { 
                    if( data.data.productLimitPrice - data.data.productTotalPriceApply > 0 ){
                        this.setState({
                            InputNum:true
                        })
                    }
                    this.setState({
                        dataModel: { ...data.data }
                    })
                }
            })
        } 
        if(this.props.editMode == 'QuickApply'){
            if(this.state.dataModel.productLimitPrice - this.state.dataModel.productTotalPriceApply > 0 ){
                this.setState({
                    InputNum:true
                })
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if ('submitLoading' in nextProps) {
          this.setState({
            loading: nextProps.submitLoading,
          });
        }
    }

    //检索数据
    fetchFbProductList(condition) {
        condition.branchPriceOpenFlag = 1;
        this.props.recruitProductPriceListFB(condition).payload.promise.then((response) => {
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

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) { 
                var postData = {};
                if(this.props.editMode == 'Create'){
                    postData = {
                        productPriceApplyId: this.state.dataModel.productPriceApplyId,
                        productId: this.state.dataModel.productId,
                        recruitBatchId: values.recruitBatchId,
                        productTotalPrice: values.productTotalPriceApply,
                        applyReason: values.applyReason,
                        publishState: 1,
                    };   
                }else{ 
                    postData = {
                        productPriceApplyId: this.state.dataModel.productPriceApplyId,
                        productId: this.state.dataModel.productId,
                        recruitBatchId: this.state.dataModel.recruitBatchId,
                        productTotalPrice: values.productTotalPriceApply,
                        applyReason: values.applyReason,
                        publishState: 1,
                    };   
                }  
                // if(that.state.LimitPrice){
                //     if(postData.productTotalPrice<that.state.LimitPrice)return message.warning("申请特价不能低于商品最低限价！") 
                // }
                this.props.setSubmitLoading(true); 
                // this.setState({loading:true})
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
                {this.state.dataModel.productId && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '提交')}</Button>}
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
    inputNumberChange = (data) =>{ 
        if( data < this.state.LimitPrice ){
            this.setState({
                InputNum:true
            })
        }else{
            this.setState({
                InputNum:false
            })
        }
    }
    inputNumberChangeEdit = (data) =>{ 
        if(!this.props.currentDataModel.productLimitPrice)return 
        if( data < this.props.currentDataModel.productLimitPrice ){
            this.setState({
                InputNum:true
            })
        }else{
            this.setState({
                InputNum:false
            })
        }
    }
    inputNumberChangeQuick = (data) =>{ 
        if(!this.state.dataModel.productLimitPrice)return 
        if( data < this.state.dataModel.productLimitPrice ){
            this.setState({
                InputNum:true
            })
        }else{
            this.setState({
                InputNum:false
            })
        }
    }
    //多种模式视图处理
    renderEditModeOfView() {     
        let block_content = <div></div> 
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="招生季">
                                    {getFieldDecorator('recruitBatchId', {
                                        initialValue: this.state.pagingSearch.recruitBatchId
                                    })(
                                        <SelectRecruitBatch hideAll={true} isFirstSelected={true} onSelectChange={(value, selectOptions) => {
                                            this.props.form.resetFields(['productTotalPriceApply'])
                                            this.state.dataModel.productTotalPrice = this.state.LimitPrice =  '';
                                            this.setState({ currentRecruitBatchIndex: selectOptions.key, currentRecruitBatchId: value ,data:[]}); 
                                            this.state.pagingSearch.recruitBatchId = value;//招生季ID
                                            this.state.pagingSearch.itemId = "";
                                            this.state.pagingSearch.classTypeId = "";
                                            this.state.dataModel.productId = "";
                                            this.setState({ pagingSearch: this.state.pagingSearch,dataModel:this.state.dataModel });
                                            this.fetchFbProductList(this.state.pagingSearch);
                                            setTimeout(() => {
                                                {/* 重新重置才能绑定这个科目值 */ }
                                                this.props.form.resetFields(['itemId', 'classTypeId', 'productId']);
                                            }, 500);
                                        }} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="项目" >
                                    {getFieldDecorator('itemId', { initialValue: '' })(
                                        <SelectItem scope='my' hideAll={false}
                                            onSelectChange={(value, selectOptions) => {
                                                this.state.pagingSearch.itemId = value
                                                this.state.dataModel.productId = "";
                                                this.setState({ pagingSearch: this.state.pagingSearch });
                                                this.fetchFbProductList(this.state.pagingSearch);
                                                setTimeout(() => {
                                                    {/* 重新重置才能绑定这个科目值 */ }
                                                    this.props.form.resetFields(['productId']);
                                                }, 500);
                                            }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="班型" >
                                    {getFieldDecorator('classTypeId', {
                                        initialValue: dataBind(this.state.dataModel.classTypeId),
                                        rules: [{
                                            required: false, message: '请选择班型!',
                                        }],
                                    })(
                                        <SelectClassType hideAll={false}
                                            onSelectChange={(value, selectOptions) => {
                                                this.state.pagingSearch.classTypeId = value
                                                this.state.dataModel.productId = "";
                                                this.setState({ pagingSearch: this.state.pagingSearch });
                                                this.fetchFbProductList(this.state.pagingSearch);
                                                setTimeout(() => {
                                                    {/* 重新重置才能绑定这个科目值 */ }
                                                    this.props.form.resetFields(['productId']);
                                                }, 500);
                                            }}
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品"
                                >
                                    {getFieldDecorator('productId', {
                                        initialValue: dataBind(this.state.dataModel.productId),
                                        rules: [{
                                            required: true, message: '请选择商品!',
                                        }],
                                    })(
                                        <Select
                                            showSearch={true}
                                            filterOption={(inputValue, option) => {
                                                return (option.props.children.indexOf(inputValue) != -1);
                                            }}
                                            onChange={(value, selectOptions) => {
                                                let num = '';
                                                this.state.data.forEach(e=>{if(value == e.productId)num = e.productLimitPrice}); 
                                                this.state.dataModel.productId = value;
                                                let productInfo = this.state.data.find(a => a.productId == value);
                                                this.state.dataModel.productType = productInfo.productType;
                                                this.state.dataModel.isRehear = productInfo.isRehear;
                                                this.state.dataModel.productTotalPrice = productInfo.productTotalPrice;
                                                this.setState({ dataModel: this.state.dataModel,LimitPrice:num });
                                            }}>
                                            {this.state.data.map((item, index) => {
                                                return <Option value={`${item.productId}`} key={index} title={item.productName}>{item.productName}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="招生季"
                                >
                                    {this.state.dataModel.recruitBatchName}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="班型"
                                >
                                    {this.state.dataModel.classTypeName}
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
                            {(true || this.state.dataModel.productId) && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品标价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPrice)}</span>
                                </FormItem>
                            </Col>
                            }
                            {
                                this.state.LimitPrice  && 
                                 <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品最低限价"
                                    >
                                        ¥<span style={{ color: 'red' }}>{formatMoney(this.state.LimitPrice)}</span>
                                    </FormItem>
                                </Col>
                            }
                             {
                                this.props.editMode == 'Edit' && this.props.currentDataModel.productLimitPrice  && 
                                 <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品最低限价"
                                    >
                                        ¥<span style={{ color: 'red' }}>{formatMoney(this.props.currentDataModel.productLimitPrice)}</span>
                                    </FormItem>
                                </Col>
                            }
                            {(true || this.state.dataModel.productId) && this.props.editMode == 'Edit' && <div><Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请特价"
                                >
                                    {getFieldDecorator('productTotalPriceApply', {
                                        initialValue: dataBind(this.state.dataModel.productTotalPriceApply),
                                        rules: [{
                                            required: true, message: '请设置申请特价!',
                                        }],
                                    })(
                                        <InputNumber onChange = {(data)=>this.inputNumberChangeEdit(data)} min={0} step={1} />
                                        )}
                                </FormItem>
                            </Col>
                            {
                                this.state.InputNum && <p style={{float:'left',marginLeft:'-22%',color:'red',marginTop:'4px'}}>提示 : 申请特价低于最低限价</p> 
                            } 
                            </div>
                            }
                            {(true || this.state.dataModel.productId) && this.props.editMode == 'Create' && <div><Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请特价"
                                >
                                    {getFieldDecorator('productTotalPriceApply', {
                                        initialValue: dataBind(this.state.dataModel.productTotalPriceApply),
                                        rules: [{
                                            required: true, message: '请设置申请特价!',
                                        }],
                                    })(  
                                            <InputNumber onChange = {(data)=>this.inputNumberChange(data)} min={0} step={1} />  
                                        )}
                                </FormItem>
                            </Col>
                            {
                                this.state.InputNum && <p style={{float:'left',marginLeft:'-22%',color:'red',marginTop:'4px'}}>提示 : 申请特价低于最低限价</p> 
                            } 
                            </div>
                            }
                            {(true || this.state.dataModel.productId) && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="申请理由"
                                >
                                    {getFieldDecorator('applyReason', {
                                        initialValue: this.state.dataModel.applyReason,
                                        rules: [{
                                            required: true, message: '请设置申请理由!',
                                        }],
                                    })(
                                        <TextArea rows={4} style={{ width: '80%' }} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                        </Row>
                    </Form>
                );
                break;
            case "QuickApply":   
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
                                    {this.state.dataModel.productName}
                                </FormItem>
                            </Col>
                            {/* <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="包含课程数"
                                >
                                    {this.state.dataModel.courseCount}
                                </FormItem>
                            </Col> */}
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
                                    label="商品标价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPrice)}</span>
                                </FormItem>
                            </Col>
                            {
                                this.state.dataModel.productLimitPrice  && 
                                 <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品最低限价"
                                    >
                                        ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productLimitPrice)}</span>
                                    </FormItem>
                                </Col>
                            }
                            <Col span={12}>
                              <FormItem
                                   {...searchFormItemLayout}
                                   label="申请特价"
                               >
                                   {getFieldDecorator('productTotalPriceApply', {
                                       initialValue:this.state.dataModel.productTotalPriceApply,
                                       rules: [{
                                           required: true, message: '请设置申请特价!',
                                       }],
                                   })(
                                       <InputNumber onChange = {(data)=>this.inputNumberChangeQuick(data)} min={0} step={1} />
                                       )}
                               </FormItem>  
                            </Col>
                            {
                                this.state.InputNum && <p style={{float:'left',marginLeft:'-24%',color:'red',marginTop:'4px'}}>提示 : 申请特价低于最低限价</p> 
                            } 
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="申请理由"
                                >
                                    {getFieldDecorator('applyReason', {
                                        initialValue: this.state.dataModel.applyReason,
                                        rules: [{
                                            required: true, message: '请设置申请理由!',
                                        }],
                                    })(
                                        <TextArea rows={4} style={{ width: '80%' }} />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                );
                break;
            case "View":
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
                                    {this.state.dataModel.productName}
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
                                    label="商品标价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPrice)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="申请特价"
                                >
                                    ¥<span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productTotalPriceApply)}</span>
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
                    </Form>
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

        getByProductPriceApplyRelevanceF: bindActionCreators(getByProductPriceApplyRelevanceF, dispatch),
        recruitProductPriceListFB: bindActionCreators(recruitProductPriceListFB, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
