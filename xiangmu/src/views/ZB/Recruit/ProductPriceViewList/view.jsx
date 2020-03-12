/*
招生季编辑
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Table, Input, Button, Icon, DatePicker, InputNumber } from 'antd';
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
    recruitBindProductPriceInfoUpById, recruitCourseProductPriceInfoById, recruitBindProductPriceInfoById
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
        };
    }

    componentWillMount() {
        //加载字典数据
        this.loadBizDictionary(['dic_Status', 'dic_YesNo', 'producttype', 'teachmode','dic_Allow']);

        //加载最新商品基本信息（课程商品、捆绑商品都支持）
        this.props.recruitCourseProductPriceInfoById(this.state.dataModel.productId, this.state.dataModel.productPriceId).payload.promise.then((response) => {
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
        //捆绑商品列表清单
        if (this.props.currentDataModel.productType == 1) {
            this.setState({ loading: true })
            if (this.props.editMode == 'Edit') {
                this.props.recruitBindProductPriceInfoUpById(this.state.dataModel.productId, this.state.dataModel.recruitBatchId, this.state.dataModel.productPriceId).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.setState({
                            loading: false,
                            data: data.data,
                        }, () => {
                            //分项总价
                            this.calcTotalStandardPrice();
                        })
                    }
                })
            }
            else {
                this.props.recruitBindProductPriceInfoById(this.state.dataModel.productId, this.state.dataModel.recruitBatchId, this.state.dataModel.productPriceId).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.result === false) {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        this.setState({
                            loading: false,
                            data: data.data,
                        }, () => {
                            //分项总价
                            this.calcTotalStandardPrice();
                        })
                    }
                })
            }
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


                if (this.props.currentDataModel.productType == 1) {
                    let productCoursePrices = this.state.data.map((item) => {
                        return {
                            productCoursePriceId: item.productCoursePriceId,
                            coursePrice: item.coursePrice,
                            classHour: item.classHour
                        }
                    })
                    let postData = {
                        productPriceId: this.props.currentDataModel.productPriceId,
                        productCoursePrices: productCoursePrices,
                        productTotalPrice: values.productPrice
                    };
                    that.props.viewCallback(postData);
                }
                else {
                    let postData = {
                        productPriceId: this.props.currentDataModel.productPriceId,
                        productPrice: values.productPrice,
                        classHour: values.classHour,
                    };
                    that.props.viewCallback(postData);
                }
            }
        });
    }
    //标题
    getTitle() {
        //加载最新的数据
        let op = `${this.props.editMode == 'Edit' ? '设置' : '查看'}`
        return `${op}商品标准价格详细信息`;
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
                                    {getDictionaryTitle(this.state.producttype, this.props.currentDataModel.productType)}
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
                                    label="所属项目"
                                >
                                    {this.state.dataModel.itemName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="科目"
                                >
                                    {this.state.dataModel.courseCategryName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="授课方式"
                                >
                                    {getDictionaryTitle(this.state.teachmode, this.state.dataModel.teachMode)}
                                </FormItem>
                            </Col>
                            {this.state.dataModel.teachMode == 2 && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="网课有效天数"
                                >
                                    {this.state.dataModel.onlinecCourseDays}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品定价"
                                >
                                    {getFieldDecorator('productPrice', {
                                        initialValue: dataBind(this.state.dataModel.productPrice),
                                        rules: [{
                                            required: true, message: '请设置商品定价!',
                                        }],
                                    })(
                                        <InputNumber min={0} step={1} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="标准学时"
                                >
                                    {getFieldDecorator('classHour', {
                                        initialValue: dataBind(this.state.dataModel.classHour),
                                        rules: [{
                                            required: true, message: '请设置学时!',
                                        }],
                                    })(
                                        <InputNumber min={0} step={1} />
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
                                    {getDictionaryTitle(this.state.producttype, this.props.currentDataModel.productType)}
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
                                    label="所属项目"
                                >
                                    {this.state.dataModel.itemName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="科目"
                                >
                                    {this.state.dataModel.courseCategryName}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="授课方式"
                                >
                                    {getDictionaryTitle(this.state.teachmode, this.state.dataModel.teachMode)}
                                </FormItem>
                            </Col>
                            {this.state.dataModel.teachMode == 2 && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="网课有效天数"
                                >
                                    {this.state.dataModel.onlinecCourseDays}
                                </FormItem>
                            </Col>
                            }
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="商品定价"
                                >
                                    {formatMoney(this.state.dataModel.productPrice)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="标准学时"
                                >
                                    {this.state.dataModel.classHour}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                );
                break;
        }
        return block_content;
    }
    //计算总的价格
    calcTotalStandardPrice = (forceRateCalc) => {
        let productTotalPrice = 0;
        this.state.data.map((item, index) => {
            if (!forceRateCalc) {
                if (item.coursePrice != null) {//已经设定价格
                    productTotalPrice += parseFloat(item.coursePrice);//累加
                }
                else {
                    if (item.rate != null) {// 没有设置价格，但是有商品比例,根据公式：总价*比例
                        item.coursePrice = (this.state.dataModel.productPrice * (item.rate || 0) / 100).toFixed(2);
                        productTotalPrice += parseFloat(item.coursePrice);//累加
                    }
                    else {
                        //否则就纯手工录入
                    }
                }
            }
            else {//商品价格调整后根据比例自动计算
                if (index + 1 < this.state.data.length) {
                    item.coursePrice = (this.state.dataModel.productPrice * item.rate / 100).toFixed(2);
                    productTotalPrice += parseFloat(item.coursePrice);//累加
                }
                else {//最后一项规则：总价-前面累计和
                    item.coursePrice = (this.state.dataModel.productPrice - productTotalPrice).toFixed(2);
                    productTotalPrice = this.state.dataModel.productPrice;
                }
            }
        })
        this.setState({ productTotalPrice, data: this.state.data });
        setTimeout(() => {
            {/* 重新重置才能绑定这个科目值 */ }
            this.props.form.resetFields([`productPrice`]);
        }, 500)
    }
    //多种模式视图处理
    renderEditModeOfView_BindProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let columnsPriceEdit = [
            {
                title: '商品名称',
                dataIndex: 'productName',
                width: 200,
                fixed: 'left',
            },
            {
                title: '班型',
                dataIndex: 'classTypeName',
            },
            {
                title: '授课方式',
                dataIndex: 'teachModeName',
            },
            {
                title: '包含科目',
                dataIndex: 'courseCategoryName',
            },
            {
              title: '课程数',
              dataIndex: 'courseCount',
            },
            {
              title: '状态',
              dataIndex: 'state',
              render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_Status, record.state);
              }
            },
            {
              title: '是否赠送',
              dataIndex: 'isGive',
              render: (text, record, index) => {
                return getDictionaryTitle(this.state.dic_YesNo, record.isGive);
              }
            },
            {
              title: <div>标准课时</div>,
              dataIndex: 'classHour',
            },
            {
              title: <div>定价(¥)</div>,
              width: 150,
              fixed: 'right',
              //自定义显示
              render: (text, record, index) => (formatMoney(record.coursePrice))
            }
        ];
        switch (this.props.editMode) {
            case "View":
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
                                    {getDictionaryTitle(this.state.producttype, this.props.currentDataModel.productType)}
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
                                    label="所属项目"
                                >
                                    {this.state.dataModel.itemName}
                                </FormItem>
                            </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="状态"
                            >
                              {getDictionaryTitle(this.state.dic_Status, this.state.dataModel.state)}
                            </FormItem>
                          </Col>
                          <Col span={12}>
                            <FormItem
                              {...searchFormItemLayout}
                              label="所属科目"
                            >
                              {this.state.dataModel.courseCategryName}
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
                        </Row>
                        <Row>
                          <div style={{width:'90%',margin:'0 auto'}}>
                            <Table columns={columnsPriceEdit} //列定义
                                   pagination={false}
                                   dataSource={this.state.data}//数据
                                   bordered
                                   scroll={{ x: 1000 }}
                            />
                          </div>
                        </Row>
                    </Form>
                );
                break;
        }
        return block_content;
    }
    render() {
        let title = this.getTitle();
        console.log(this.props.currentDataModel)
        //对应编辑模式
        let block_editModeView = this.props.currentDataModel.productType == 1 ? this.renderEditModeOfView_BindProduct() : this.renderEditModeOfView_CourseProduct();
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
        recruitBindProductPriceInfoById: bindActionCreators(recruitBindProductPriceInfoById, dispatch),
        recruitBindProductPriceInfoUpById: bindActionCreators(recruitBindProductPriceInfoUpById, dispatch),
        recruitCourseProductPriceInfoById: bindActionCreators(recruitCourseProductPriceInfoById, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
