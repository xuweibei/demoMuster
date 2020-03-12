import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber, Radio } from 'antd';
const RadioGroup = Radio.Group;
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { getCourseCategoryList, getClassList } from '@/actions/base';
import ContentBox from '@/components/ContentBox';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
//默认空班型内置ID
const EmptyClassTypeId = '00000000000000000000000000000001';
class ProductEditView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            productType: props.currentDataModel.productType.toString(),//商品类型
            teachMode: (props.currentDataModel.teachMode || '').toString(),
            dic_items: [],
            dic_ClassTypes: [],//班型
            dic_courseCategory: [],//科目
        };
    }

    componentWillMount() {
        //修改模式下，级联触发恢复选项
        if (this.props.editMode == 'Edit') {
            //课程商品、捆绑商品 根据项目id==>班型
            this.fetchClassTypeList(split(this.state.dataModel.itemIds));
            //课程商品时，根据项目id==>科目
            if (this.state.dataModel.productType == '2') {
                this.fetchCourseCategoryList(this.state.dataModel.itemIds);
            }
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '编辑');
        let productTypeInfo = "";
        if (this.state.productType.toString() == '1') {
            productTypeInfo = '捆绑商品'
        }
        else {
            productTypeInfo = '课程商品'
        }
        return `${op}${productTypeInfo}`;
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '保存')}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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

    //商品类型改变触发
    // onProductTypeChange = (value) => {
    //     this.setState({ productType: value });
    // }

    //项目改变
    onItemChange = (value) => {
        this.state.dataModel.classTypeId = '';
        this.state.dataModel.courseCategoryId = '';
        this.setState({ dataModel: this.state.dataModel })
        //捆绑商品时支持多选
        if (this.state.productType == '1') {
            this.fetchClassTypeList(value);//数组类型
            setTimeout(() => {
                {/* 重新重置才能绑定这个班型值 */ }
                this.props.form.resetFields(['classTypeId']);
            }, 500);
        }
        else {
            this.fetchClassTypeList([value]);//转换为数组类型
            //加载项目设定的科目列表
            this.fetchCourseCategoryList(value);
            setTimeout(() => {
                {/* 重新重置才能绑定这个科目值 */ }
                this.props.form.resetFields(['classTypeId', 'courseCategoryId']);
            }, 500);
        }
    }
    //根据所选项目检索班型数据
    fetchClassTypeList = (itemIds) => {
        let condition = { currentPage: 1, pageSize: 999, state: 1, itemIds: itemIds.join(','), state: 1 };
        this.props.getClassList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_ClassTypes: data.data.map((a) => { return { title: a.classTypeName, value: a.classTypeId.toString() } }) })
            }
        })
    }
    //检索科目列表数据
    fetchCourseCategoryList = (itemId) => {
        let condition = { currentPage: 1, pageSize: 999, courseCategoryStatus: 1, itemId: itemId };
        this.props.getCourseCategoryList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                message.error(data.message);
            }
            else {
                this.setState({ dic_courseCategory: data.data.map((a) => { return { title: a.name, value: a.courseCategoryId.toString(), courseCategoryStatus: a.courseCategoryStatus } }) });
                setTimeout(() => {
                    {/* 重新重置才能绑定这个科目值 */ }
                    this.props.form.resetFields(['courseCategoryId']);
                }, 500);
            }
        })
    }
    //授课方式改变
    onTeachModelChange = (value) => {
        this.setState({ teachMode: value });
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                {
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品名称"
                                    >
                                        {getFieldDecorator('productName', {
                                            initialValue: this.state.dataModel.productName,
                                            rules: [
                                                {
                                                    required: true, message: '请输入商品名称!',
                                                }],
                                        })(
                                            <Input
                                                placeholder="请输入商品名称"
                                            />
                                            )}
                                    </FormItem>
                                </Col>
                                {/* <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="商品属性"
                                    >
                                        {getFieldDecorator('productType', {
                                            initialValue: dataBind(this.state.dataModel.productType),
                                            rules: [{
                                                required: true, message: '请选择商品属性!',
                                            }],
                                        })(
                                            <Select onChange={this.onProductTypeChange}>
                                                {this.props.producttype.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col> */}
                                {/*必选，课程商品时单选，捆绑商品时多选*/}
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="所属项目"
                                    >
                                        {getFieldDecorator('itemIds', {
                                            initialValue: this.state.productType == '2' ? this.state.dataModel.itemIds.toString() : split(this.state.dataModel.itemIds),
                                            rules: [{
                                                required: true, message: '请选择所属项目!',
                                            }],
                                        })(
                                            <Select onChange={this.onItemChange} mode={this.state.productType == '2' ? 'default' : 'multiple'}>
                                                {this.props.dic_MyItems.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col>
                                {/* 捆绑商品时必选、单选(去掉‘无’班型)，课程商品时可选（显示‘无’） */}
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="班型"
                                    >
                                        {getFieldDecorator('classTypeId', {
                                            initialValue: dataBind(this.state.dataModel.classTypeId),
                                            rules: [{
                                                required: true, message: '请选择班型!',
                                            }],
                                        })(
                                            <Select>
                                                {this.state.dic_ClassTypes.filter((a) => {
                                                    if (this.state.productType == '1') {
                                                        return a.value != EmptyClassTypeId;//捆绑商品时去除‘无’班型
                                                    }
                                                    else {
                                                        return true;//课程商品时全部班型
                                                    }
                                                }).map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col>
                                {this.state.productType == '2' && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="所属科目"
                                    >
                                        {getFieldDecorator('courseCategoryId', {
                                            initialValue: dataBind(this.state.dataModel.courseCategoryId),
                                            rules: [{
                                                required: true, message: '请选择所属科目!',
                                            }],
                                        })(
                                            <Select>
                                                {this.state.dic_courseCategory.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col>
                                }
                                {this.state.productType == '2' && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="授课方式"
                                    >
                                        {getFieldDecorator('teachMode', {
                                            initialValue: dataBind(this.state.dataModel.teachMode),
                                            rules: [{
                                                required: true, message: '请选择授课方式!',
                                            }],
                                        })(
                                            <Select onChange={this.onTeachModelChange}>
                                                {this.props.teachmode.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="重听"
                                    >
                                        {getFieldDecorator('isRehear', {
                                            initialValue: dataBind(this.state.dataModel.isRehear),
                                            rules: [{
                                                required: true, message: '请选择重听!',
                                            }],
                                        })(
                                            <RadioGroup>
                                                {this.props.dic_Allow.map((item, index) => {
                                                    return <Radio value={item.value} key={index}>{item.title}</Radio>
                                                })}
                                            </RadioGroup>
                                            )}
                                    </FormItem>
                                </Col>
                                {(false && this.state.productType == '2' && this.state.teachMode == '2') && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="网课激活方式"
                                    >
                                        {getFieldDecorator('onlineCourseActiveType', {
                                            initialValue: dataBind(this.state.dataModel.onlineCourseActiveType),
                                            rules: [{
                                                required: true, message: '请选择网课激活方式!',
                                            }],
                                        })(
                                            <Select>
                                                {this.props.rehear_type.map((item, index) => {
                                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                                })}
                                            </Select>
                                            )}
                                    </FormItem>
                                </Col>
                                }
                                {(this.state.productType == '2' && this.state.teachMode == '2') && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="网课有效天数"
                                    >
                                        {getFieldDecorator('onlineCourseDays', {
                                            initialValue: dataBind(this.state.dataModel.onlineCourseDays),
                                            rules: [{
                                                required: true, message: '请设置网课有效天数!',
                                            }],
                                        })(
                                            <InputNumber min={0} step={1} />
                                            )}
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="状态"
                                    >
                                        {getFieldDecorator('state', {
                                            initialValue: dataBind(this.state.dataModel.state),
                                            rules: [{
                                                required: true, message: '请选择状态!',
                                            }],
                                        })(
                                            <RadioGroup>
                                                {this.props.dic_Status.map((item, index) => {
                                                    return <Radio value={item.value} key={index}>{item.title}</Radio>
                                                })}
                                            </RadioGroup>
                                            )}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem
                                        {...{
                                            labelCol: { span: 4 },
                                            wrapperCol: { span: 20 },
                                        }}
                                        style={{ paddingRight: 18 }}

                                        label="说明"
                                    >
                                        {getFieldDecorator('remark', {
                                            initialValue: this.state.dataModel.remark
                                        })(
                                            <TextArea placeholder='请输入说明' rows={4} style={{ width: '88%' }} />
                                            )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form >
                    )
                }
                break;
            case 'Edit2':
                {
                    block_content = (
                        <Form layout="Vertical">
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
                                        {getDictionaryTitle(this.props.producttype, this.state.dataModel.productType)}
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

                                {this.state.dataModel.productType == 2 && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="所属科目"
                                    >
                                        {this.state.dataModel.courseCategryName}
                                    </FormItem>
                                </Col>
                                }
                                {this.state.dataModel.productType == 2 && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="授课方式"
                                    >
                                        {getDictionaryTitle(this.props.teachmode, this.state.dataModel.teachMode)}
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="重听"
                                    >
                                        {getDictionaryTitle(this.props.dic_Allow, this.state.dataModel.isRehear)}
                                    </FormItem>
                                </Col>
                                {(false && this.state.dataModel.productType == 2 && this.state.dataModel.teachMode == 2) && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="网课激活方式"
                                    >
                                        {getDictionaryTitle(this.state.rehear_type, this.state.dataModel.onlineCourseActiveType)}
                                    </FormItem>
                                </Col>
                                }
                                {(this.state.dataModel.productType == 2 && this.state.dataModel.teachMode == 2) && <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="网课有效天数"
                                    >
                                        {getFieldDecorator('onlineCourseDays', {
                                            initialValue: dataBind(this.state.dataModel.onlineCourseDays),
                                            rules: [{
                                                required: true, message: '请设置网课有效天数!',
                                            }],
                                        })(
                                            <InputNumber min={0} step={1} />
                                            )}
                                    </FormItem>
                                </Col>
                                }
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="状态"
                                    >
                                        {getFieldDecorator('state', {
                                            initialValue: dataBind(this.state.dataModel.state),
                                            rules: [{
                                                required: true, message: '请选择状态!',
                                            }],
                                        })(
                                            <RadioGroup>
                                                {this.props.dic_Status.map((item, index) => {
                                                    return <Radio value={item.value} key={index}>{item.title}</Radio>
                                                })}
                                            </RadioGroup>
                                            )}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem
                                        {...searchFormItemLayout24}
                                        style={{ paddingRight: 18 }}

                                        label="说明"
                                    >
                                        {this.state.dataModel.remark}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                    )
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedProductView = Form.create()(ProductEditView);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    let { UserDic_ItemList: dic_MyItems, AllDic_ClassTypeList: dic_ClassTypes } = Dictionarys;
    return { dic_MyItems, dic_ClassTypes };
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
        getClassList: bindActionCreators(getClassList, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedProductView);
